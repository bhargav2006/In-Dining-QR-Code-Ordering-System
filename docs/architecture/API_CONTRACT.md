# Backend API Contract

**Audited Backend:** `D:\DevSpace\Restaurant-QR-Ordering-System\backend`  
**Base URL:** `http://localhost:8080` (or relative path `/api/*` via Vite development proxy)  
**Authentication Standard:** Stateless JWT via HTTP Header `Authorization: Bearer <jwt_token>`  
**Status:** 100% Verified from Spring Boot Source Files  

---

## 1. Authentication Endpoints (`AuthController.java`)

### 1.1 Staff / Manager Login
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No (Public)
- **Request Body:** `LoginRequestDto`
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response Body (200 OK):** `AuthResponseDto`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "type": "Bearer",
    "username": "admin",
    "fullName": "System Administrator",
    "role": "ROLE_ADMIN",
    "restaurantId": 1,
    "restaurantName": "Gourmet Bistro",
    "restaurantSlug": "gourmet-bistro"
  }
  ```
- **Errors:** `401 Unauthorized` (Bad credentials), `400 Bad Request` (Missing fields).
- **Backend File:** `com.qr_restaurant.qr_restaurant_backend.controller.AuthController.java`

---

### 1.2 Register Restaurant & Admin
- **Endpoint:** `POST /api/auth/register-restaurant`
- **Auth Required:** No (Public)
- **Request Body:** `RegisterRestaurantDto`
  ```json
  {
    "restaurantName": "Urban Greens",
    "description": "Artisanal organic kitchen",
    "address": "123 Botanical Road, Hyderabad",
    "phone": "+91 98765 43210",
    "logoUrl": "https://example.com/logo.png",
    "fullName": "Bhargav K",
    "username": "bhargav",
    "password": "securePassword123",
    "email": "bhargav@example.com"
  }
  ```
- **Response Body (200 OK):** `AuthResponseDto`
- **Errors:** `400 Bad Request` (Username already exists or validation failure).

---

### 1.3 List All Registered Restaurants
- **Endpoint:** `GET /api/auth/restaurants`
- **Auth Required:** No (Public)
- **Response Body (200 OK):** `List<Restaurant>`
  ```json
  [
    {
      "id": 1,
      "name": "Gourmet Bistro",
      "slug": "gourmet-bistro",
      "description": "Fine dining restaurant with artisanal culinary creations",
      "address": "123 Culinary Boulevard, Foodville",
      "phone": "+1 (555) 234-5678",
      "logoUrl": "/assets/brand-logo.png",
      "active": true
    }
  ]
  ```

---

## 2. Customer Portal Endpoints (`CustomerController.java`)

### 2.1 Start or Resume Table Session
- **Endpoint:** `POST /api/customer/session/start`
- **Auth Required:** No (Public)
- **Request Body:** `TableScanRequestDto`
  ```json
  {
    "qrToken": "QR-GB-TBL-1-TOKEN",
    "tableId": null,
    "restaurantId": null,
    "sessionToken": null
  }
  ```
  *(Note: Can provide `qrToken` OR `tableId` + `restaurantId`. If customer has an existing `sessionToken` stored in `localStorage`, provide it to resume.)*
- **Response Body (200 OK):** `TableScanResponseDto`
  ```json
  {
    "sessionToken": "SESS-A1B2C3D4",
    "tableId": 1,
    "tableNumber": 1,
    "capacity": 4,
    "tableStatus": "OCCUPIED",
    "qrToken": "QR-GB-TBL-1-TOKEN",
    "restaurantId": 1,
    "restaurantName": "Gourmet Bistro",
    "restaurantSlug": "gourmet-bistro",
    "restaurantLogoUrl": "/assets/brand-logo.png"
  }
  ```
- **Errors:** `404 Not Found` (Invalid QR Code or Table), `400 Bad Request`.

---

### 2.2 Get Active Menu Categories
- **Endpoint:** `GET /api/customer/categories`
- **Query Parameters:** `?restaurantId=1` OR `?restaurantSlug=gourmet-bistro`
- **Response Body (200 OK):** `List<Category>`
  ```json
  [
    {
      "id": 1,
      "name": "Appetizers",
      "description": "Starters and small bites",
      "imageUrl": "https://images.unsplash.com/...",
      "displayOrder": 1,
      "active": true
    }
  ]
  ```

---

### 2.3 Get Available Menu Dishes
- **Endpoint:** `GET /api/customer/menu`
- **Query Parameters:**
  - `restaurantId` (Optional Long)
  - `restaurantSlug` (Optional String)
  - `categoryId` (Optional Long)
  - `search` (Optional String keyword)
- **Response Body (200 OK):** `List<Dish>`
  ```json
  [
    {
      "id": 10,
      "name": "Truffle Mushroom Risotto",
      "description": "Arborio rice cooked with wild forest mushrooms, black truffle oil, and parmesan",
      "price": 499.00,
      "imageUrl": "https://images.unsplash.com/...",
      "available": true,
      "vegetarian": true,
      "spicy": false,
      "preparationTimeMinutes": 18,
      "category": { "id": 2, "name": "Main Course" }
    }
  ]
  ```

---

### 2.4 Place New Order
- **Endpoint:** `POST /api/customer/orders`
- **Auth Required:** No (Public)
- **Request Body:** `CreateOrderRequestDto`
  ```json
  {
    "sessionToken": "SESS-A1B2C3D4",
    "specialInstructions": "Extra spicy, dressing on the side",
    "items": [
      {
        "dishId": 10,
        "quantity": 2,
        "specialRequest": "Less salt please"
      }
    ]
  }
  ```
- **Response Body (201 Created):** `OrderResponseDto`
  ```json
  {
    "id": 101,
    "orderNumber": "ORD-A1B2C3D4-101",
    "tableNumber": 1,
    "status": "PLACED",
    "specialInstructions": "Extra spicy, dressing on the side",
    "totalAmount": 998.00,
    "createdAt": "2026-11-03T15:30:00",
    "items": [
      {
        "id": 201,
        "dishId": 10,
        "dishName": "Truffle Mushroom Risotto",
        "dishImageUrl": "https://images.unsplash.com/...",
        "quantity": 2,
        "unitPrice": 499.00,
        "subtotal": 998.00,
        "specialRequest": "Less salt please"
      }
    ]
  }
  ```

---

### 2.5 Get All Orders for Active Session
- **Endpoint:** `GET /api/customer/orders/session/{sessionToken}`
- **Response Body (200 OK):** `List<OrderResponseDto>` (Ordered descending by creation time).

---

### 2.6 Call Waiter / Assistance Request
- **Endpoint:** `POST /api/customer/assistance`
- **Request Body:** `AssistanceRequestDto`
  ```json
  {
    "sessionToken": "SESS-A1B2C3D4",
    "requestType": "WATER",
    "note": "Drinking water refill needed"
  }
  ```
  *(Supported `requestType` values: `WATER`, `BILL_REQUEST`, `WAITER_HELP`, `CLEAN_TABLE`)*
- **Response Body (201 Created):** `AssistanceRequestDto` with `status: "PENDING"`.

---

### 2.7 Generate Itemized Bill Receipt
- **Endpoint:** `GET /api/customer/bill/receipt/{sessionToken}`
- **Response Body (200 OK):** `BillReceiptDto`
  ```json
  {
    "sessionToken": "SESS-A1B2C3D4",
    "tableNumber": 1,
    "restaurantName": "Gourmet Bistro",
    "subtotal": 998.00,
    "taxPercent": 5.0,
    "taxAmount": 49.90,
    "tipAmount": 0.00,
    "grandTotal": 1047.90,
    "orders": [ ... ],
    "generatedAt": "2026-11-03T15:45:00",
    "isPaid": false
  }
  ```

---

### 2.8 Process Payment
- **Endpoint:** `POST /api/customer/bill/pay`
- **Request Body:** `CustomerPaymentDto`
  ```json
  {
    "sessionToken": "SESS-A1B2C3D4",
    "paymentMethod": "UPI_QR",
    "tipAmount": 50.00
  }
  ```
  *(Supported `paymentMethod` values: `CASH`, `CARD`, `UPI_QR`)*
- **Response Body (200 OK):** `BillReceiptDto` with `isPaid: true` and updated `grandTotal`.
- **Side Effect:** If `paymentMethod == "CASH"`, creates a waiter assistance request (`BILL_REQUEST`) and sets table to `BILL_REQUESTED`. If electronic (`CARD`, `UPI_QR`), sets orders to `COMPLETED`, session to `CLOSED`, and table to `AVAILABLE`.

---

### 2.9 Cancel Uncooked Order
- **Endpoint:** `DELETE /api/customer/orders/{orderId}?sessionToken={sessionToken}`
- **Response Body (200 OK):** `OrderResponseDto` (with `status: "CANCELLED"`).
- **Errors:** `400 Bad Request` ("Cannot cancel order: kitchen has already begun preparing this order").

---

## 3. Waiter Operations (`WaiterController.java`)
*Authorization: `Authorization: Bearer <jwt_token>` (Requires `ROLE_WAITER` or `ROLE_ADMIN`)*

### 3.1 Get Floor Tables Status
- **Endpoint:** `GET /api/waiter/tables`
- **Response Body (200 OK):** `List<RestaurantTable>`

### 3.2 Update Table Status
- **Endpoint:** `PATCH /api/waiter/tables/{tableId}/status?status=AVAILABLE`
- **Allowed statuses:** `AVAILABLE`, `OCCUPIED`, `BILL_REQUESTED`, `CLEANING_NEEDED`.

### 3.3 Get Pending Assistance Requests
- **Endpoint:** `GET /api/waiter/assistance`
- **Response Body (200 OK):** `List<AssistanceRequestDto>`

### 3.4 Resolve Assistance Request
- **Endpoint:** `PATCH /api/waiter/assistance/{requestId}/resolve`
- **Response Body (200 OK):** `AssistanceRequestDto` (Status `RESOLVED`).

### 3.5 Get Ready-to-Serve Orders
- **Endpoint:** `GET /api/waiter/orders/ready`
- **Response Body (200 OK):** `List<OrderResponseDto>` (Orders with status `READY`).

### 3.6 Mark Order Served
- **Endpoint:** `PATCH /api/waiter/orders/{orderId}/serve`
- **Response Body (200 OK):** `OrderResponseDto` (Status `SERVED`).

### 3.7 Checkout & Liberate Table
- **Endpoint:** `POST /api/waiter/tables/{tableId}/checkout`
- **Response Body (200 OK):** `TableSession` (Closes all active sessions, marks all orders `COMPLETED`, sets table `AVAILABLE`).

---

## 4. Kitchen Display System (KDS) (`KitchenController.java`)
*Authorization: `Authorization: Bearer <jwt_token>` (Requires `ROLE_KITCHEN` or `ROLE_ADMIN`)*

### 4.1 Get Active Kitchen Orders
- **Endpoint:** `GET /api/kitchen/orders`
- **Response Body (200 OK):** `List<OrderResponseDto>` (Orders with statuses `PLACED` and `PREPARING`).

### 4.2 Update Kitchen Order Status
- **Endpoint:** `PATCH /api/kitchen/orders/{orderId}/status?status=PREPARING`
- **Allowed statuses:** `PREPARING`, `READY`.
- **Response Body (200 OK):** `OrderResponseDto`.

---

## 5. Manager & Administration (`ManagerController.java`)
*Authorization: `Authorization: Bearer <jwt_token>` (Requires `ROLE_ADMIN`)*

### 5.1 Category Management
- `GET /api/manager/categories` -> `List<Category>`
- `POST /api/manager/categories` (Body: `CategoryRequestDto`) -> `201 Created`
- `PUT /api/manager/categories/{id}` (Body: `CategoryRequestDto`) -> `200 OK`
- `DELETE /api/manager/categories/{id}` -> `204 No Content`

### 5.2 Dish Management
- `GET /api/manager/dishes` -> `List<Dish>`
- `POST /api/manager/dishes` (Body: `DishRequestDto`) -> `201 Created`
- `PUT /api/manager/dishes/{id}` (Body: `DishRequestDto`) -> `200 OK`
- `PATCH /api/manager/dishes/{id}/toggle-availability` -> `200 OK`
- `DELETE /api/manager/dishes/{id}` -> `204 No Content`

### 5.3 Table & QR Code Management
- `GET /api/manager/tables` -> `List<RestaurantTable>`
- `POST /api/manager/tables` (Body: `TableRequestDto`) -> `201 Created`
- `POST /api/manager/tables/{id}/regenerate-qr` -> `200 OK` (Generates new random QR token)
- `PUT /api/manager/tables/{id}` (Body: `TableRequestDto`) -> `200 OK`
- `DELETE /api/manager/tables/{id}` -> `204 No Content`

### 5.4 Analytics & Orders
- `GET /api/manager/analytics/dashboard` -> `SalesSummaryDto`
  ```json
  {
    "totalRevenue": 45290.00,
    "totalOrders": 124,
    "averageOrderValue": 365.24,
    "activeTablesCount": 6,
    "topSellingDishes": [
      {
        "dishId": 10,
        "dishName": "Truffle Mushroom Risotto",
        "quantitySold": 48,
        "revenueGenerated": 23952.00
      }
    ]
  }
  ```
- `GET /api/manager/orders` -> `List<OrderResponseDto>` (Full history).
