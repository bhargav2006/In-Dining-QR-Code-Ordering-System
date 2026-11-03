# Frontend Implementation Plan: Restaurant QR Ordering Platform (`frontend-v2`)

**Status:** Phase 0–5 Implementation, Integration, Testing & Quality Assurance Fully Complete — Production Ready  
**Architecture:** React 19 + Vite 6 + Tailwind CSS + Global Design System  
**Themes:** Verdant Signal Light & Obsidian & Forest Dark  
**Brand Logo:** Circular `Bhargav_KB_Logo.png`  
**Backend:** Spring Boot 4.1.0 (`http://localhost:8080`)  

---

## Roadmap Overview

```mermaid
flowchart TD
    P0[Phase 0: Investigation & Contracts] --> P1[Phase 1: Scaffolding & Setup]
    P1 --> P2[Phase 2: Design System & Primitives]
    P2 --> P3[Phase 3: API & State Infrastructure]
    P3 --> P4[Phase 4: Customer Dine-In Experience]
    P3 --> P5[Phase 5: Kitchen Display System - KDS]
    P3 --> P6[Phase 6: Waiter Floor Operations]
    P3 --> P7[Phase 7: Manager Portal & Analytics]
    P4 --> P8[Phase 8: Quality Control & Playwright Audit]
    P5 --> P8
    P6 --> P8
    P7 --> P8
```

---

## Detailed Implementation Phases

### Phase 0: Architecture Investigation & Contract Definition (COMPLETED)
- [x] Full audit of Spring Boot 4.1.0 backend controllers, services, repositories, models, and DTOs.
- [x] Full audit of backup frontend application and pain points.
- [x] Verification of Global Design System tokens (`Verdant Signal` & `Obsidian & Forest`).
- [x] Inspection of circular brand logo asset (`Bhargav_KB_Logo.png`).
- [x] Documentation written: `docs/architecture/PROJECT_AUDIT.md`, `docs/architecture/API_CONTRACT.md`.

---

### Phase 1: Frontend Workspace Scaffolding (`frontend-v2/`)
- [ ] Initialize clean Vite + React 19 project inside `frontend-v2/`.
- [ ] Configure `vite.config.js` with API proxy forwarding `/api` to `http://localhost:8080`.
- [ ] Configure Tailwind CSS with design system semantic color variables.
- [ ] Import and format `Bhargav_KB_Logo.png` into `public/assets/` as a clean circular brand element.
- [ ] Establish directory structure (`components/`, `pages/`, `hooks/`, `services/`, `context/`, `styles/`, `types/`).

---

### Phase 2: Design System Integration & UI Primitive Components
- [ ] Import design tokens from `D:\DesignSystems\Global-Design-System` (`tokens.css`, `themes.css`).
- [ ] Implement theme manager hook (`useTheme`) supporting:
  - **Verdant Signal Light:** Botanical green accents, warm parchment backgrounds, clean crisp surfaces.
  - **Obsidian & Forest Dark:** Deep obsidian (`#0B0F0E`), emerald/forest accents (`#10B981`), silver-white text, subtle gold highlights.
- [ ] Build reusable UI primitives:
  - `Button` (primary, secondary, danger, outline, ghost, sizes with loading spinners)
  - `Card` (elevated surface with subtle border and backdrop blur)
  - `Badge` (status badges for `AVAILABLE`, `OCCUPIED`, `PLACED`, `PREPARING`, `READY`, `SERVED`)
  - `Modal` / `Drawer` (accessible dialog with keyboard traps and backdrop overlay)
  - `Input` & `Select` (accessible form elements with floating labels and error states)
  - `CircularLogo` (responsive brand component displaying `Bhargav_KB_Logo.png`)
  - `ThemeToggle` (one-click theme switcher)

---

### Phase 3: Core API Services & State Management Layer
- [ ] Axios client with request/response interceptors:
  - Automatically attaches `Authorization: Bearer <token>` for staff routes.
  - Handles 401 unauthorized redirects to `/login`.
  - Structured error message extraction for toast notifications.
- [ ] **TableSessionStore / Context:**
  - Manages `sessionToken`, `tableNumber`, `restaurantSlug`, `restaurantId`, `tableStatus`.
  - Syncs state with `localStorage` to survive mobile browser reloads.
- [ ] **CartStore / Context:**
  - Items, quantities, item notes (`specialRequest`), subtotal calculation.
  - Add to cart, increment/decrement, remove, and clear operations.
- [ ] **AuthStore / Context:**
  - Staff token, username, role (`ROLE_ADMIN`, `ROLE_KITCHEN`, `ROLE_WAITER`), restaurant info.

---

### Phase 4: Customer Dine-In Experience (Mobile-First)
- [x] **QR Landing & Session Start:**
  - URL parameter detection (`/table/:tableNumber`, `/r/:restaurantSlug/table/:tableNumber`, `/qr/:qrToken`).
  - Auto-initializes or resumes session via `POST /api/customer/session/start`.
- [x] **Menu Browsing & Search:**
  - Category pill filter carousel with smooth scrolling.
  - Live dish search input with instant filtering.
  - Dietary chips (Vegetarian, Non-Veg, Chef's Special).
  - Dish card with dish image, pricing, preparation time, and "Add" button with quantity stepper.
- [x] **Dish Detail Modal:**
  - High-res visual presentation, full description, allergy warnings, special cooking notes input.
- [x] **Cart & Order Drawer:**
  - Sticky bottom order bar with item count and subtotal preview.
  - Slide-up cart drawer with order review, table-level special instructions, and "Send to Kitchen" CTA.
- [x] **Live Order Tracker:**
  - Real-time order progress timeline (`PLACED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`).
  - Itemized dish status breakdown.
  - Order cancellation button (active only while status is `PLACED`).
  - Smart polling (every 12s) with manual refresh button.
- [x] **Call Waiter Feature:**
  - Quick-action floating button opening assistance options: Water, Bill, Waiter Help, Clean Table.
  - Instant confirmation toast and request status.
- [x] **Bill & Digital Checkout:**
  - Itemized receipt modal (Subtotal, 5% Tax, Tip selector, Grand Total).
  - Payment method selector (`CASH`, `CARD`, `UPI_QR`).
  - Simulated payment processing with animated receipt summary.

---

### Phase 5: Kitchen Display System (KDS)
- [x] Dedicated full-screen route (`/kitchen`, `/kds`, `/staff/login`).
- [x] Role-protected operations interface (`ROLE_KITCHEN` or `ROLE_ADMIN`).
- [x] Active ticket grid displaying `PLACED` (Incoming Orders) and `PREPARING` (In Preparation) orders.
- [x] Elapsed preparation timers with visual urgency thresholds (normal, warning at 10m, urgent at 20m).
- [x] Action workflow buttons: "Start Preparation" (`PATCH /api/kitchen/orders/{id}/status?status=PREPARING`) and "Mark Ready for Service" (`PATCH /api/kitchen/orders/{id}/status?status=READY`).
- [x] Synthesized Web Audio API bell chime and subtle badge alert on new order ticket arrivals with staff mute toggle.
- [x] 8-second background polling with tab visibility pausing and live connection status indicators (`LIVE SYNC`, `RECONNECTING`, `OFFLINE`).
- [x] End-to-end verified with live customer orders placed from Table 2 and real Spring Boot MySQL updates.

---

### Phase 6: Waiter Floor Portal (COMPLETED)
- [x] Dedicated route (`/waiter`, `/floor`, `/staff/waiter`).
- [x] **Floor Overview:** Grid of restaurant tables with real-time status indicators (`AVAILABLE`, `OCCUPIED`, `BILL_REQUESTED`, `CLEANING_NEEDED`).
- [x] **Pending Assistance Queue:** Alert queue displaying customer help calls (`WATER`, `BILL_REQUEST`, `WAITER_HELP`, `CLEAN_TABLE`) with 1-click "Resolve" button.
- [x] **Ready-to-Serve Queue:** Alerts for dishes marked ready by kitchen with 1-click "Mark Served" action.
- [x] **Table Checkout Action:** Final checkout and table liberation workflow with itemized bill preview and confirmation modal.
- [x] Role-protected station requiring `ROLE_WAITER` or `ROLE_ADMIN` (blocks unauthorized `ROLE_KITCHEN` and guest users).
- [x] 10-second smart polling with visibility change pause/resume and connection status indicators (`FLOOR SYNC`, `RECONNECTING`, `OFFLINE`).
- [x] Web Audio API bell chime for incoming ready food and assistance calls with mute toggle.
- [x] Verified end-to-end with live Spring Boot backend, Playwright automated testing, and responsive audit across Desktop, Tablet, and Mobile.

---

### Phase 7: Manager & Administration Portal (COMPLETED)
- [x] Dedicated routes (`/manager`, `/manager/*`, `/admin`, `/staff/admin`).
- [x] **Role Security & Access Control:** Protected by `ROLE_ADMIN`; non-admin staff (`ROLE_KITCHEN`, `ROLE_WAITER`) and unauthenticated guests are blocked with dedicated permission denial views.
- [x] **Analytics Dashboard:** Real-time metrics synthesized directly from verified database orders (`todaySales`, `todayOrdersCount`, `allTimeSales`, `allTimeOrdersCount`, AOV, occupancy rate, and active kitchen tickets).
- [x] **Category Management:** Full CRUD operations for menu categories (`GET`, `POST`, `PUT`, `DELETE /api/manager/categories`) with display order management and active visibility toggles.
- [x] **Dish Catalog & 86 Management:** Full CRUD operations for dishes (`GET`, `POST`, `PUT`, `DELETE /api/manager/dishes`) with 1-click `86 Availability Toggle` (`PATCH /api/manager/dishes/{id}/toggle-availability`), price editing, category assignment, prep times, and live image previews.
- [x] **Table & QR Code Management:** Full table lifecycle (`GET`, `POST`, `PUT`, `DELETE /api/manager/tables`) with live high-contrast SVG QR codes (`qrcode.react`), customer entry route verification (`/qr/:qrToken` & `/r/:slug/table/:num`), printable standee badges, and QR token regeneration (`POST /api/manager/tables/{id}/regenerate-qr`).
- [x] **Order History & Receipts:** Consolidated historical audit log (`GET /api/manager/orders`) grouped by dining session with status filters (`ALL`, `COMPLETED`, `READY`, `PREPARING`, `CANCELLED`), order/table search, and itemized receipt inspection modals.
- [x] **Responsive & Theme Verified:** Fully verified in `Obsidian & Forest Dark` and `Verdant Signal Light` across Desktop (1440x900), Tablet (768x1024), and Mobile (375x812) with zero overflow.

---

### Phase 8: Quality Assurance, Playwright & Visual Polish (COMPLETED — PHASE 5)
- [x] Comprehensive responsive audit across Desktop (1440x900, 1920x1080), Tablet (768x1024), and Mobile (375x812).
- [x] Zero horizontal or unintended vertical overflow checks across all viewports.
- [x] WCAG 2.1 AA accessibility audit (contrast, aria-labels, keyboard navigation, focus rings).
- [x] End-to-end lifecycle verification with live Spring Boot backend & MariaDB:
  1. Customer QR Entry (`/table/:num`, `/qr/:qrToken`) -> Session initialization (`POST /api/customer/session/start`).
  2. Menu browsing with dietary chips & dish detail modal -> Add to cart -> Place Order (`POST /api/customer/orders`).
  3. Kitchen Display System (`/kitchen`) -> Ticket arrival chime -> `PLACED` -> `PREPARING` -> `READY`.
  4. Waiter Floor Portal (`/waiter`) -> Ready queue alert -> `PATCH /api/waiter/orders/{id}/serve` -> `SERVED`.
  5. Customer Assistance Calls -> All 4 types (`WATER`, `BILL_REQUEST`, `WAITER_HELP`, `CLEAN_TABLE`) verified and resolved by waiter.
  6. Final Table Checkout & Liberation -> `POST /api/waiter/tables/{id}/checkout` -> Table resets to `AVAILABLE`.
  7. Manager Portal (`/manager`) -> Real-time sales KPIs & audit history record order.
- [x] Security & Role Access Matrix:
  - Anonymous requests to `/api/kitchen/**`, `/api/waiter/**`, `/api/manager/**` blocked with HTTP 401.
  - Role-based restrictions enforced (`ROLE_WAITER` blocked from manager with 403, `ROLE_KITCHEN` blocked from manager with 403).
  - Tampered/invalid JWT tokens rejected with 401.
- [x] Optimized Route Code-Splitting (`React.lazy` + `Suspense`):
  - Main bundle reduced by 45% (from 582 kB down to 321 kB).
  - Independent route chunks for `CustomerPortal` (70.76 kB), `ManagerPortal` (75.54 kB), `WaiterPortal` (47.37 kB), `KitchenDisplay` (31.44 kB).
- [x] Production build (`npm run build`) compiles cleanly in **1.08s** with zero errors or warnings.
