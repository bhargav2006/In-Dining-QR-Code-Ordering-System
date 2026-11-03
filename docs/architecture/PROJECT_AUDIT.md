# Project Audit: Restaurant QR Ordering System

**Audit Date:** November 3, 2026  
**Auditor:** Antigravity Agent  
**Status:** Complete & Verified from Source Code (Phase 0.5 Update)  
**Target Backend:** `D:\DevSpace\Restaurant-QR-Ordering-System\backend`  
**Reference Backup (READ-ONLY):** `D:\DevSpace\Restaurant-QR-Ordering-System-backup`  
**Master Design System (READ-ONLY):** `D:\DesignSystems\Global-Design-System`  
**Brand Logo Asset:** `D:\DevSpace\Bhargav_KB_Logo.png`  

---

## 1. Project Directory Structure

```text
D:\DevSpace\
├── Restaurant-QR-Ordering-System/         # ACTIVE PROJECT WORKSPACE
│   ├── backend/                           # Verified Java 21 / Spring Boot 4.1.0 backend (UNTOUCHED)
│   │   ├── pom.xml                        # Maven dependencies & build config
│   │   └── src/main/java/com/qr_restaurant/qr_restaurant_backend/
│   │       ├── QrRestaurantBackendApplication.java
│   │       ├── config/                    # SecurityConfig, JwtAuthenticationFilter, AppConfig, DataInitializer
│   │       ├── controller/                # AuthController, CustomerController, KitchenController, ManagerController, WaiterController
│   │       ├── dto/                       # 15 DTO request/response schemas
│   │       ├── exception/                 # GlobalExceptionHandler, ResourceNotFoundException, BadRequestException, etc.
│   │       ├── model/                     # JPA Entities: User, Restaurant, RestaurantTable, TableSession, Category, Dish, Order, OrderItem, AssistanceRequest
│   │       ├── repository/                # Spring Data JPA Repositories
│   │       ├── security/                  # JwtUtil, SecurityUtil, CustomUserDetailsService
│   │       └── service/                   # AuthService, CustomerService, KitchenService, ManagerService, WaiterService
│   ├── docs/                              # Project specifications & contracts
│   │   ├── architecture/
│   │   │   ├── PROJECT_AUDIT.md           # [This Document]
│   │   │   └── API_CONTRACT.md            # Complete endpoint schemas & status codes
│   │   ├── design/
│   │   │   └── DESIGN_BRIEF.md
│   │   └── planning/
│   │       └── IMPLEMENTATION_PLAN.md     # Phased implementation roadmap
│   └── frontend-v2/                       # Active Scaffolding: React + Vite application workspace
│
├── Restaurant-QR-Ordering-System-backup/  # PRESERVED ORIGINAL BACKUP (STRICTLY READ-ONLY)
│   ├── backend/                           # Original backend backup
│   └── frontend/                          # Monolithic React 19 backup
│
├── Bhargav_KB_Logo.png                    # Brand master logo asset
└── DesignSystems/
    └── Global-Design-System/              # Master Global Design System tokens & CSS (STRICTLY READ-ONLY)
```

---

## 2. Design System Audit & Token Resolution

### Source of Truth Verification:
Master files inspected directly in `D:\DesignSystems\Global-Design-System`:
- `themes.css`
- `tokens.css`
- `tokens.json`
- `COLOR-PALETTE.md`

### Resolved Discrepancy Analysis:
- **Discrepancy in previous report:** Mentioned `#0B0F0E` (generic dark) and `#10B981` (default Tailwind emerald).
- **Master Design System Source of Truth:**
  - Dark Theme Background (`--color-bg`): `#0E1111` (Carbon 850).
  - Dark Theme Primary Text (`--color-text`): `#EAECEB` (Carbon 100).
  - Dark Theme Primary Brand (`--color-primary`): `#42946A` (Alpine Forest Green 600) with hover `#52A87C` and active `#2D6A4F`.
  - Forest Palette Primitives in `tokens.json`:
    - `forest-900`: `#122C1F` (`--color-primary-container`)
    - `forest-700`: `#2D6A4F` (`--color-primary-active`)
    - `forest-600`: `#42946A` (`--color-primary`)
    - `forest-500`: `#52A87C` (`--color-primary-hover`)
    - `forest-300`: `#A2E0C0` (`--color-on-primary-container`)
  - No default Tailwind greens (`#10B981`) or generic darks (`#0B0F0E`) will be used; the master tokens will govern 100% of the UI.

---

## 3. Backend Stack & Configuration

- **Framework:** Spring Boot `4.1.0` (managed by parent `org.springframework.boot:spring-boot-starter-parent:4.1.0`)
- **Java Version:** `21` (LTS)
- **Primary Dependencies:**
  - `spring-boot-starter-webmvc` (REST APIs)
  - `spring-boot-starter-security` (Authentication & Authorization)
  - `spring-boot-starter-data-jpa` (ORM & Data Access)
  - `spring-boot-starter-validation` (Bean Validation API: `@Valid`, `@NotBlank`, `@Min`, etc.)
  - `io.jsonwebtoken:jjwt-api:0.12.6` (JWT token generation & parsing)
  - `io.jsonwebtoken:jjwt-impl:0.12.6` / `jjwt-jackson:0.12.6`
  - `org.projectlombok:lombok` (Boilerplate reduction)
  - `com.mysql:mysql-connector-j` (Runtime relational DB) / `com.h2database:h2` (In-memory test fallback)
- **Server Port:** `8080` (context path: `/`)
- **Default Database:** MySQL database `qr_restaurant_db` with `ddl-auto: update`.
- **CORS Configuration:** Explicitly permitted for `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://localhost:5174`, `https://*.vercel.app`, and wildcards with methods `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.

---

## 4. Frontend Stack (Backup Reference vs. New Architecture)

### Backup Frontend (`Restaurant-QR-Ordering-System-backup/frontend`):
- React `19.0.0`, Vite `6.0.5`, Tailwind CSS `3.4.17`, Axios `1.7.9`.
- **Identified Defects:** Monolithic components (`CustomerPortal.jsx` is 61 KB, 1,400+ lines; `ManagerDashboard.jsx` is 47 KB), untyped and unorganized state, hardcoded styling with no real design tokens, and no separation of concerns.

### New Frontend Architecture (`frontend-v2`):
- React `19` + Vite `6` with clean modular architecture.
- Modular layer: UI primitives (`components/ui`), customer experience components (`components/customer`), staff views (`components/kitchen`, `components/waiter`, `components/manager`).
- Centralized API services in `services/apiClient.js` with Axios interceptors.
- Session & Cart contexts (`TableSessionContext`, `CartContext`, `AuthContext`).
- Exact master design tokens from `D:\DesignSystems\Global-Design-System` imported as CSS custom properties.

---

## 5. Authentication & Role-Based Access Control

### Stateless JWT Implementation:
- Tokens are issued upon successful authentication at `POST /api/auth/login`.
- JWT Token claims contain `sub` (username), `role` (`ROLE_ADMIN`, `ROLE_KITCHEN`, `ROLE_WAITER`), and `restaurantId`.
- Authorization header format: `Authorization: Bearer <jwt_token>`.
- Token expiration: Configured via `application.properties` (default: 24 hours / 86400000 ms).

### User Roles:
1. **`ROLE_ADMIN` (Manager):** Full access to `/api/manager/**`, `/api/waiter/**`, `/api/kitchen/**`.
2. **`ROLE_KITCHEN` (Chef / KDS Operator):** Access to `/api/kitchen/**`.
3. **`ROLE_WAITER` (Floor Staff):** Access to `/api/waiter/**`.
4. **Customer (Public / Session-Based):** Public access to `/api/customer/**` identified by `sessionToken` (`SESS-XXXXXXXX`) generated upon scanning table QR code.

---

## 6. Seeded Accounts & Default Data (Verified from `DataInitializer.java`)

- **Default Restaurant:** Gourmet Bistro (slug: `gourmet-bistro`)
- **Default Accounts:**
  - Admin/Manager: `admin` / `admin123` (`ADMIN` role)
  - Kitchen Staff: `chef` / `kitchen123` (`KITCHEN` role)
  - Waiter: `waiter` / `waiter123` (`WAITER` role)
- **Preconfigured Tables:** 10 Tables (Tables 1 to 10), each with tokens such as `QR-GB-TBL-1-TOKEN` to `QR-GB-TBL-10-TOKEN`.
- **Preconfigured Categories:** Appetizers, Main Course, Beverages, Desserts with initial dishes.

---

## 7. Verified Application Features

| Feature Domain | Verified Functionality | Backend Source File |
| :--- | :--- | :--- |
| **Session & QR Token** | Start/resume customer table session via QR token or table+restaurant ID. Recovers existing active session if occupied. | `CustomerService.java`, `CustomerController.java` |
| **Menu Browsing** | Fetch active categories and available dishes filtered by category, search query, and restaurant slug. | `CustomerService.java`, `CustomerController.java` |
| **Order Placement** | Multi-dish ordering with special cooking requests, item quantity validation, and live price snapshotting. | `CustomerService.java`, `OrderRepository.java` |
| **Order Tracking** | Fetch all session orders with statuses (`PLACED` -> `PREPARING` -> `READY` -> `SERVED` -> `COMPLETED`). | `CustomerService.java` |
| **Order Cancellation** | Customers can cancel orders *only* if the order is still in `PLACED` status. | `CustomerService.java` (Line 389) |
| **Assistance Calls** | Customers can call staff for `WATER`, `BILL_REQUEST`, `WAITER_HELP`, `CLEAN_TABLE`. | `CustomerService.java`, `AssistanceRequestRepository.java` |
| **Bill & Payment** | Calculate itemized receipt (subtotal, 5% tax, tip, grand total). Payment modes: `CASH`, `CARD`, `UPI_QR`. Cash flags `BILL_REQUESTED`; electronic closes session. | `CustomerService.java` |
| **Kitchen Display** | Live queue of `PLACED` and `PREPARING` orders. One-click progress to `PREPARING` or `READY`. | `KitchenService.java`, `KitchenController.java` |
| **Waiter Floor View** | Table status dashboard (`AVAILABLE`, `OCCUPIED`, `BILL_REQUESTED`, `CLEANING_NEEDED`). Pending assistance queue. Ready-to-serve orders queue. Table checkout action. | `WaiterService.java`, `WaiterController.java` |
| **Manager CRUD** | Categories, Dishes (with availability toggle), Tables (with QR code regeneration). | `ManagerService.java`, `ManagerController.java` |
| **Manager Analytics** | Sales summary dashboard (total revenue, total orders, average order value, top dishes, active table count). | `ManagerService.java` |

---

## 8. Incomplete, Missing, or Backend-Unsupported Features

1. **No WebSockets or Server-Sent Events (SSE):**
   - The Spring Boot backend exposes pure HTTP REST endpoints without STOMP or WebSocket brokers.
   - **Requirement:** Live kitchen, waiter, and customer order tracking must utilize scheduled client polling (e.g., 8s–10s intervals) or user-initiated refresh.
2. **Simulated Payment Gateway:**
   - `POST /api/customer/bill/pay` processes payment internally without connecting to Razorpay, Stripe, or bank APIs.
3. **No File Upload Endpoint:**
   - Dish and category image URLs are stored as strings (`imageUrl`). Images must be provided as hosted links.
4. **No Customer Profiles or Authentication:**
   - Customer orders are tied strictly to the transient `TableSession`. Once the table is checked out and closed, the customer cannot access historical orders.
5. **No Table Reservation Engine:**
   - Tables operate solely on physical dine-in walk-in occupancy.

---

## 9. Integration Risks & Mitigation Strategies

1. **Multi-Tenancy Scoping:**
   - Staff/Manager endpoints rely on the JWT `restaurantId`. Customer endpoints require either `restaurantId` or `restaurantSlug` in query params.
   - *Mitigation:* Ensure the customer portal automatically preserves `restaurantSlug` and `tableId` in URL search params and local storage.
2. **Polling Pressure on Database:**
   - Multiple active KDS screens and waiter portals polling frequently could trigger database strain.
   - *Mitigation:* Standardize smart polling intervals (8s for KDS, 10s for Waiter, 12s for customer order tracker) with pause on tab blur.
3. **Session Token Loss:**
   - If a customer refreshes their browser, the `sessionToken` must not be lost.
   - *Mitigation:* Persist `activeSessionToken`, `currentTableNumber`, and `currentRestaurantSlug` in browser `localStorage`.
4. **Order Cancellation Race Condition:**
   - A customer attempting to cancel an order after the kitchen has started preparing it will receive an HTTP 400 Bad Request error.
   - *Mitigation:* Display clear UI messaging indicating that cancellations are disabled once food preparation begins.
