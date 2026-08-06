# 🍃 Spring Boot Architecture & Folder Structure Guide

Welcome! This guide explains how this Spring Boot application is structured, what each package does, why files are separated into specific folders, and how data flows through the application layers.

---

## 🎯 The Core Concept: 3-Tier Layered Architecture

Spring Boot follows the **Layered Architecture Pattern** (Separation of Concerns). Instead of putting all code into one giant file, we split the application into specialized packages:

```
                  ┌───────────────────────────────────────────────┐
                  │                 HTTP Request                  │
                  │   (e.g., POST /api/customer/orders from React)│
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. CONTROLLER LAYER  (@RestController)                                           │
│    • Receives incoming HTTP Requests from Frontend/Client                        │
│    • Validates input using DTOs                                                  │
│    • Calls Service layer and returns HTTP Responses (JSON)                       │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 2. SERVICE LAYER     (@Service)                                                  │
│    • Contains core Business Logic & Rules                                        │
│    • Calculates taxes, totals, validates dish availability & session status       │
│    • Maps DTOs to Entities & communicates with Repositories                       │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 3. REPOSITORY LAYER  (JpaRepository)                                             │
│    • Data Access Layer                                                           │
│    • Generates SQL queries automatically to fetch, save, or update data          │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 4. DATABASE LAYER    (MySQL / H2 Database)                                       │
│    • Stores permanent data (Tables, Categories, Dishes, Orders, Users)           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Detailed Folder & Package Structure Explained

Here is the exact file tree under `src/main/java/com/qr_restaurant/qr_restaurant_backend/`:

```
backend/src/main/
├── java/com/qr_restaurant/qr_restaurant_backend/
│   │
│   ├── QrRestaurantBackendApplication.java  # 🚀 Entry Point (Main Method)
│   │
│   ├── controller/                         # 🌐 API Endpoints (HTTP Request Handlers)
│   │   ├── CustomerController.java
│   │   ├── KitchenController.java
│   │   ├── WaiterController.java
│   │   ├── ManagerController.java
│   │   └── AuthController.java
│   │
│   ├── service/                            # 🧠 Business Logic & Workflow Processing
│   │   ├── CustomerService.java
│   │   ├── KitchenService.java
│   │   ├── WaiterService.java
│   │   ├── ManagerService.java
│   │   └── AuthService.java
│   │
│   ├── repository/                         # 🗄️ Database Operations (Spring Data JPA)
│   │   ├── RestaurantTableRepository.java
│   │   ├── TableSessionRepository.java
│   │   ├── CategoryRepository.java
│   │   ├── DishRepository.java
│   │   ├── OrderRepository.java
│   │   ├── AssistanceRequestRepository.java
│   │   └── UserRepository.java
│   │
│   ├── model/                              # 📦 Database Entities & Enums (Tables)
│   │   ├── RestaurantTable.java
│   │   ├── TableSession.java
│   │   ├── Category.java
│   │   ├── Dish.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── AssistanceRequest.java
│   │   ├── User.java
│   │   └── enums/                          # Fixed status constants
│   │       ├── TableStatus.java            (AVAILABLE, OCCUPIED, BILL_REQUESTED, CLEANING_NEEDED)
│   │       ├── OrderStatus.java            (PLACED, PREPARING, READY, SERVED, COMPLETED)
│   │       ├── SessionStatus.java          (ACTIVE, CLOSED)
│   │       ├── AssistanceType.java         (WATER, BILL_REQUEST, WAITER_HELP, CLEAN_TABLE)
│   │       └── UserRole.java               (ADMIN, KITCHEN, WAITER)
│   │
│   ├── dto/                                # 📩 Data Transfer Objects (Request/Response Shapes)
│   │   ├── TableScanRequestDto.java
│   │   ├── TableScanResponseDto.java
│   │   ├── CreateOrderRequestDto.java
│   │   ├── OrderResponseDto.java
│   │   ├── DishRequestDto.java
│   │   └── SalesSummaryDto.java
│   │
│   ├── exception/                          # ⚠️ Error Handling
│   │   ├── ResourceNotFoundException.java
│   │   ├── InvalidSessionException.java
│   │   ├── BadRequestException.java
│   │   └── GlobalExceptionHandler.java
│   │
│   └── config/                             # ⚙️ App Configurations & Data Initializer
│       ├── CorsConfig.java                 (Allows React frontend communication)
│       └── DataInitializer.java            (Seeds initial menu, tables & accounts)
│
└── resources/
    └── application.properties              # 🔧 Database Credentials & Server Port Settings
```

---

## 🔍 Package-by-Package Breakdown

### 1. `model/` (Entities)
- **What is it?** Classes annotated with `@Entity` and `@Table`. Each Java class represents a **MySQL table** in the database, and each class field is a **column**.
- **Example**: `Dish.java` maps to the `dishes` database table (with columns `id`, `name`, `price`, `is_available`).
- **Where is it used?** Used by `repository/` to execute SQL and by `service/` to read/update business data.

### 2. `dto/` (Data Transfer Objects)
- **What is it?** Plain Java objects used specifically for **carrying data** into or out of HTTP API requests.
- **Why do we need it?** We don't want to expose raw database entities directly to the React frontend (e.g. hiding internal database structure or internal keys).
- **Example**: `CreateOrderRequestDto.java` receives `sessionToken`, `items`, and `notes` sent by the customer React cart.
- **Where is it used?** `controller/` receives DTOs from frontend and returns DTO responses.

### 3. `repository/` (Spring Data JPA Interfaces)
- **What is it?** Interfaces that extend `JpaRepository<Entity, PrimaryKeyType>`.
- **Why is it magical?** You don't write complex SQL queries manually! Spring Data JPA automatically generates SQL statements like `SELECT`, `INSERT`, `UPDATE`, `DELETE` based on method names.
- **Example**: `findByTableNumber(Integer number)` automatically generates `SELECT * FROM restaurant_tables WHERE table_number = ?`.
- **Where is it used?** Injected into `service/` classes to query or save data.

### 4. `service/` (Business Logic Layer)
- **What is it?** Classes annotated with `@Service`. This is the **brain** of your Spring Boot application.
- **What does it do?**
  1. Performs business rules (e.g. "Is the dish currently available? If not, throw an error!").
  2. Calculates totals (subtotal + 5% tax).
  3. Uses Repositories to query/save database records.
  4. Converts Entities into DTOs before returning to Controller.
- **Where is it used?** Called by `controller/`.

### 5. `controller/` (REST Controllers)
- **What is it?** Classes annotated with `@RestController` and `@RequestMapping`.
- **What does it do?** Listens to HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) on specific URLs.
- **Example**: `@PostMapping("/api/customer/orders")` listens for React's order submission, calls `customerService.createOrder()`, and returns HTTP 201 Created.
- **Where is it used?** Communicates directly with the React frontend.

### 6. `exception/` (Global Error Handler)
- **What is it?** Custom exception classes and `@RestControllerAdvice` (`GlobalExceptionHandler.java`).
- **Why is it useful?** If a dish is missing or a session token is invalid, instead of crashing the server or throwing a ugly 500 error stack trace, it sends a clean JSON error response (e.g. `{ "status": 404, "message": "Dish not found" }`).

### 7. `config/` (Settings & Bootstrapping)
- **`CorsConfig.java`**: Allows your React frontend running on port 5173 to talk to Spring Boot on port 8080 without browser CORS errors.
- **`DataInitializer.java`**: Runs on server startup (`CommandLineRunner`). If your database is empty, it populates 10 tables, 4 menu categories, 8 food items, and default staff users automatically!

---

## 🔄 Step-by-Step Data Flow Example: Placing an Order

Let's follow what happens when a customer orders food in the React App:

1. **React Frontend**: Sends `POST http://localhost:8080/api/customer/orders` with JSON body:
   ```json
   {
     "sessionToken": "SESS-1234",
     "items": [ { "dishId": 1, "quantity": 2 } ],
     "notes": "Extra sauce"
   }
   ```
2. **`CustomerController.java`**:
   - Matches route `@PostMapping("/orders")`.
   - Binds JSON payload into `CreateOrderRequestDto`.
   - Passes DTO to `customerService.createOrder(dto)`.
3. **`CustomerService.java`**:
   - Queries `tableSessionRepository.findBySessionToken("SESS-1234")`.
   - Queries `dishRepository.findById(1)` to get the dish details.
   - Calculates price: `$8.50 * 2 = $17.00` + Tax `$0.85` = `$17.85`.
   - Constructs a new `Order` entity and saves it using `orderRepository.save(order)`.
   - Converts the saved entity into `OrderResponseDto`.
4. **Database (MySQL / H2)**:
   - Hibernate executes `INSERT INTO customer_orders ...` and `INSERT INTO order_items ...`.
5. **Response**:
   - `CustomerController` returns HTTP 201 JSON response back to React!

---

## 🛠️ Configuration Files Outside `java/`

- **`pom.xml`**: Maven dependencies configuration (Spring Web, Spring Data JPA, MySQL Connector, H2, Lombok, Validation).
- **`application.properties`**: Server configuration file where you set `server.port=8080`, database URLs, credentials, and Hibernate settings.
