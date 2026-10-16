# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Diners / In-Restaurant Customers**: Seated guests scanning a table QR code or navigating directly via device. They need instant access to menus without downloading apps, easy group session sharing via session tokens, dietary filtering (Veg / Non-Veg), dish customizations, real-time order status tracking, waiter assistance requests, and transparent digital billing/receipt generation.
- **Reservation Customers**: Guests seeking to pre-book dining tables ahead of time across registered restaurants with desired party sizes and time slots.
- **Waitstaff**: Floor staff managing table availability, serving ready orders from the kitchen, acknowledging diner calls (water refill, bill, table cleaning), and clearing/liberating completed tables.
- **Kitchen Staff / Chefs**: Kitchen team managing cooking pipelines via a real-time Kitchen Display System (KDS) across order stages (`PLACED` -> `PREPARING` -> `READY` -> `SERVED`).
- **Restaurant Managers / Owners**: Administrators configuring restaurant profiles, menu categories, dishes, table inventory, QR code generation, staff roles, and tracking live revenue and sales analytics.

## Product Purpose

A unified, multi-restaurant QR code dining and reservation platform designed to eliminate order friction, streamline kitchen and waitstaff operations, and give restaurants modern digital autonomy. Success means zero customer frustration at tables, instant updates across the kitchen and floor, and an intuitive, lag-free experience across all device types and network conditions.

## Positioning

Unlike generic POS systems or third-party delivery apps with hefty commissions, this platform is an owned, real-time in-dining and pre-booking ecosystem tailored for multi-restaurant operations. It marries frictionless customer self-ordering with staff workflow coordination in a lightweight web application that requires no app installation.

## Operating Context

- **Physical Dining Floor**: High ambient noise, varied lighting, mobile devices held in one hand, potentially spotty cellular connectivity, and groups dining together sharing a single table order session.
- **Kitchen Display (KDS)**: Wall-mounted tablets or landscape monitors viewed from a distance by kitchen chefs with fast pace and touch-friendly interaction targets.
- **Waiter & Manager Portals**: Mobile tablets or back-of-house desktop computers requiring dense, scan-friendly status dashboards.

## Capabilities and Constraints

- **Confirmed Capabilities**:
  - Multi-restaurant registration with isolated restaurant slugs, logos, and profiles.
  - Table QR token generation and instant table session auto-reconnect (`localStorage` persistence).
  - Occupied table locking with session token sharing (`🔑 SESS-XXXXXX`) for co-diners.
  - Category filtering, instant search, and dietary toggle (Pure Veg vs. Non-Veg).
  - Dish customization (spice levels, special instructions) and dynamic cart calculation with 5% tax.
  - Real-time waiter assistance alerts (Water, Clean Table, Waiter Call, Bill Request).
  - Digital invoicing with UPI/Card/Cash support and printable thermal receipts.
  - Kitchen Display System with preparation timers and order lifecycle updates.
  - Waiter Portal with table map, ready order pick-up, and table liberation.
  - Manager Dashboard for menu/table CRUD and revenue analytics.
- **Confirmed Additions to Build**:
  - Table pre-booking / reservation workflow.
  - Role-based permissions and robust staff coordination.
- **Technical Stack & Constraints**:
  - Frontend: React 18 SPA, Vite, Lucide Icons, Vanilla CSS with custom glassmorphism design tokens.
  - Backend: Java 21, Spring Boot 3 REST API.
  - Zero tolerance for perceptible lag: optimistic UI updates, responsive skeleton loaders, and smooth transitions even on slow network connections.

## Brand Commitments

- **Aesthetic Direction**: High-end modern web application feel with refined glassmorphism, responsive light and dark themes, crisp typography, and rich, purposeful accent colors.
- **Tone & Voice**: Welcoming, efficient, elegant, and reliable. Never cluttered, noisy, or utilitarian.
- **Interface Experience**: Fluid micro-animations, clear spatial hierarchy, immediate visual feedback, and zero dead ends.

## Evidence on Hand

- Existing full-stack codebase in [`frontend/`](file:///d:/DevSpace/Restaurant-QR-Ordering-System/frontend) with working routes:
  - `/` (Landing Page & Portal Switcher)
  - `/table/:tableNumber` and `/r/:restaurantSlug/table/:tableNumber` (Customer Portal)
  - `/kitchen` (Kitchen Display System)
  - `/waiter` (Waiter Portal)
  - `/manager` (Manager Dashboard)
  - `/payment-success` (Digital Receipt)
- Working REST API endpoints defined in [`frontend/src/services/api.js`](file:///d:/DevSpace/Restaurant-QR-Ordering-System/frontend/src/services/api.js).
- Passing backend test suite and REST contract in [`backend/`](file:///d:/DevSpace/Restaurant-QR-Ordering-System/backend).

## Product Principles

1. **Immediate Responsiveness**: Actions acknowledge the user instantaneously. Network latency is masked through optimistic states and elegant skeletons; diners never question if their order went through.
2. **Effortless Coordination**: The state of a table or order is unambiguously synchronized across the customer, waiter, and kitchen surfaces.
3. **Respect for Physical Dining**: Ordering complements conversation rather than dominating it. Scannable cards, high contrast in low light, and one-tap actions minimize time spent looking at the phone.
4. **Resilient Simplicity**: Complex multi-tenant configurations are distilled into intuitive, clean administrative controls.

## Accessibility & Inclusion

- Responsive adaptation across mobile phones, tablets, and desktop workstations.
- High-contrast visual cues for dietary requirements (distinct color, iconography, and shape badges for Pure Veg vs. Non-Veg).
- Touch target sizes of at least 44x44px for one-handed mobile and tablet kiosk use.
- Clear status indicators that do not rely solely on color (combining icons, badges, and labels).
