# 🍽️ In-Dining QR Code Ordering System

A full-stack, real-time **In-Dining QR Code Ordering & Restaurant Management System** built with **Java 21, Spring Boot 3, MySQL Cloud (Aiven), React 18, Vite**, and a custom glassmorphism design system.

---

## 🌟 System Overview & Features

The system connects restaurant diners, waitstaff, kitchen chefs, and restaurant managers through real-time REST API interfaces and session tracking.

### 📱 1. Customer Web Application (`/table/:tableNumber`)
- **Instant QR Session & Auto-Reconnect**: Persistent device session auto-login via `localStorage`. Scanned tables load active sessions without requesting codes repeatedly.
- **Occupied Table Session Code Sharing**: When marked occupied by staff, a unique code (`🔑 SESS-XXXXXX`) is generated so guests dining together can join the table session safely.
- **Dietary Pill Slider**: Animated 3-way toggle (**✨ All Menu**, **🌱 Pure Veg**, **🍗 Non-Veg**) with dynamic pointer badges and leaf/drumstick dish indicators.
- **Category Selector & Search**: Category pills (Appetizers, Main Course, Beverages, Desserts) + instant search filtering.
- **Dish Customization & Cart Drawer**: Customization options (spiciness, extra toppings, special notes) and float total price calculator.
- **Call Waiter Assistance**: Instant table service alerts (Water Refill, Bill Request, Waiter Assistance, Clean Table).
- **Tax Invoice & Digital Receipt**: Built-in 5% tax calculation, 5-star rating review, UPI QR / Card / Cash payment modes, and printable thermal tax invoice.
- **Developer DevTools Console Command**: Type `getSessionToken()` or `logToken()` in the browser developer console (`F12`) to inspect active session details.

### 👨‍🍳 2. Kitchen Display System (KDS) (`/kitchen`)
- Real-time order pipeline with status advancement (`PLACED` -> `PREPARING` -> `READY` -> `SERVED`).
- Preparation timer badges and instant order item summary.

### 🤵 3. Waiter Portal (`/waiter`)
- **Color-Coded Interactive Table Map**: Real-time status indicators (Available, Occupied, Reserved).
- **Session Code Generator**: Displays session token with a 1-click **📋 Copy Code** button to share with customers.
- **Assistance Alert Center**: Real-time waiter notifications with 1-click resolution.
- **Table Liberation & Checkout**: 1-click table reset that purges finished table sessions.

### 📊 4. Manager Dashboard (`/manager`)
- **Sales Analytics**: Live revenue stats, total orders, completed bills, and active table metrics.
- **Menu Item & Category Management**: Full CRUD operations to add, edit, delete, or toggle availability of dishes and categories.
- **Staff User Account Management**: Manage accounts for Admin, Kitchen, and Waiter personnel.

### ⚡ 5. Web UI Health Dashboard (`GET /` & `/health`)
- Glassmorphism Web UI status monitor displaying system state: **"Yeah, Backend API is Working!"**.
- Live database connection status (MySQL / H2), server timestamp, and 1-click API endpoint test links.

---

## 🏗️ System Architecture & Technology Stack

```
[ Customer Mobile / Tablet ]  <--->  [ React + Vite SPA Frontend ]
                                           |  (REST API / CORS)
[ Staff / Waiter / Kitchen ]  <--->  [ Spring Boot 3 REST API ]
                                           |  (JPA / Hibernate)
                                     [ Aiven MySQL Cloud DB ]
```

- **Backend Framework**: Java 21, Spring Boot 3, Spring Data JPA, Hibernate.
- **Frontend Framework**: React 18, Vite, Lucide Icons, Vanilla CSS (Glassmorphism design system).
- **Database**: Aiven Cloud MySQL (Production) / H2 In-Memory (Test fallback).
- **Automated Testing**: JUnit 5, Mockito, Spring Boot MockMvc.
- **Deployment**: Vercel (Frontend Single Page Application) & Render (Spring Boot REST API).

---

## 🧪 Testing Methodologies & Verification

The codebase includes automated test suites covering Unit, Integration, and Logic verification as specified in the software engineering design document:

### 1. Unit Testing (`JUnit 5 + Mockito`)
Tests individual services and repository interactions in isolation without launching a full server:
- **`CustomerServiceTest.java`**: Verifies `startOrGetSession()`, table availability checks, and dish filtering logic using Mockito mocks.

### 2. Integration Testing (`Spring MockMvc`)
Tests HTTP endpoints, request routing, JSON responses, and HTML rendering:
- **`HealthCheckControllerTest.java`**: Verifies `GET /api/health` returns JSON diagnostics and `GET /health` renders the Web UI Health Dashboard.

### 3. Program Logic & Idempotency Testing
- **Server-Side Duplicate Order Prevention**: Rejects duplicate orders submitted within 5 seconds.
- **Stale Token Purging**: Automatically purges expired session tokens when a table is marked closed by staff.

Run all tests via Maven:
```bash
cd backend
mvn test
```

---

## 🚀 Local Development Setup

### Prerequisites
- Java JDK 21+
- Node.js 18+ & npm

### 1. Start Backend API
```bash
cd backend
mvn spring-boot:run
```
> The Spring Boot backend starts at `http://localhost:8080`.
> Automatic `.env` loading will read `backend/.env` if present.

### 2. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
> The React frontend starts at `http://localhost:5173`.

---

## 📄 License
Developed for Internship Project & Educational Purposes.
