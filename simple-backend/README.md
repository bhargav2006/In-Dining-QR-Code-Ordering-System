# 🚀 Simple Backend (`simple-backend`)

Welcome to `simple-backend`! This is a **streamlined, super easy-to-understand Spring Boot backend** built specifically to make backend learning straightforward without DTO boilerplate complexity.

---

## 📁 5 Simple Folders Explained

Everything in `simple-backend` is organized into 5 clean folders under `src/main/java/com/simple_backend/`:

```
simple-backend/src/main/java/com/simple_backend/
├── controller/     # 🌐 HTTP Endpoint Handlers (Receives HTTP requests from React)
├── service/        # 🧠 Business Logic & Functionality
├── repository/     # 🗄️ Database Access Layer (Spring Data JPA SQL queries)
├── model/          # 📦 Table Structure & Database Entities (@Entity)
├── security/       # 🔒 Password Hashing & JWT Token Generation
└── config/         # ⚙️ CORS mapping & DataInitializer for auto-seeding demo data
```

---

## 🎯 Package Breakdown

### 1. `controller/` (Connects HTTP Requests)
Handles URLs from the React frontend:
- **`AuthController.java`**: `/api/auth/login`, `/api/auth/register-restaurant`
- **`CustomerController.java`**: `/api/customer/session/start`, `/api/customer/menu`, `/api/customer/orders`
- **`KitchenController.java`**: `/api/kitchen/orders`
- **`WaiterController.java`**: `/api/waiter/tables`, `/api/waiter/assistance`
- **`ManagerController.java`**: `/api/manager/analytics/dashboard`, `/api/manager/dishes`

### 2. `service/` (Logics & Functionalities)
Contains core application rules:
- **`AuthService.java`**: Validates login credentials, hashes passwords, generates tokens, seeds default starter categories and dishes upon restaurant registration.
- **`CustomerService.java`**: Starts table sessions, calculates order subtotals and 5% taxes, dispatches waiter calls.
- **`KitchenService.java`**: Fetches real-time cooking queue and advances order statuses (`PLACED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`).
- **`WaiterService.java`**: Manages table map states (`AVAILABLE`, `OCCUPIED`, `BILL_REQUESTED`, `CLEANING_NEEDED`) and processes checkout.
- **`ManagerService.java`**: Calculates dashboard revenue stats and handles dish/category CRUD.

### 3. `repository/` (Accessing the Database)
Spring Data JPA interfaces that run SQL automatically:
- **`UserRepository.java`**: `findByUsername(username)`
- **`RestaurantTableRepository.java`**: `findByTableNumberAndRestaurantId(...)`
- **`OrderRepository.java`**: `findBySessionSessionTokenOrderByCreatedAtDesc(...)`

### 4. `model/` (Database / Table Structure)
Classes annotated with `@Entity` representing MySQL tables:
- `Restaurant.java` $\rightarrow$ `restaurants` table
- `User.java` $\rightarrow$ `users` table
- `RestaurantTable.java` $\rightarrow$ `restaurant_tables` table
- `Category.java` $\rightarrow$ `categories` table
- `Dish.java` $\rightarrow$ `dishes` table
- `Order.java` $\rightarrow$ `customer_orders` table

### 5. `security/` (Security Utilities)
- **`PasswordEncoderUtil.java`**: Hashes passwords securely using SHA-256 / BCrypt.
- **`TokenProvider.java`**: Generates unique security bearer tokens.

---

## ⚙️ How to Run `simple-backend`

From the project root:
```bash
# Navigate to simple-backend
cd simple-backend

# Run Spring Boot app
mvn spring-boot:run
```
It runs on **port 8080** and seamlessly powers the React frontend!
