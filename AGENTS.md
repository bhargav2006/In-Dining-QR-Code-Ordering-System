# Repository Agent Guidelines

Welcome to the **Restaurant QR Code Ordering & Reservation System** repository. This document establishes persistent behavioral, architectural, and security rules for all AI agents, pair programmers, and automated tooling working in this codebase.

---

## 1. Core Repository Architecture & Source of Truth

- **`backend/`**: Canonical Java 21 / Spring Boot 3 REST API backend. This is the **primary backend** intended for ongoing feature development, security hardening, and deployment.
- **`simple-backend/`**: A simplified reference implementation created for learning purposes. **DO NOT delete or modify `simple-backend/` yet**; retain it as a temporary reference until explicitly directed by the user.
- **`frontend/`**: The single-page application built with React 18, Vite, Lucide Icons, and a custom glassmorphism design system.
- **`docs/`**, **`PRODUCT.md`**, **`DESIGN.md`**: Authoritative records of requirements, system behavior, and design language. Always follow these documents without inventing unapproved requirements.

---

## 2. General Engineering & Modification Rules

1. **Inspect Before Modifying**: Always inspect existing code, directory structures, and `git status` before editing or creating files. Understand the full caller-callee context.
2. **Respect Existing Architecture**:
   - Maintain the standard Spring Boot layered architecture: `controller` $\rightarrow$ `service` $\rightarrow$ `repository` $\rightarrow$ `model` (JPA entities), mediated by `dto` and `exception` packages.
   - Maintain the React/Vite structure: UI components in `components/`, route views in `pages/`, shared network calls centralized in `services/api.js`.
3. **Small, Understandable, Educational Changes**: The codebase author is actively learning Java and Spring Boot. Avoid overly abstract architectural patterns or hidden "magic." Favor clean, readable, explicit code with concise explanatory comments suitable for learning developers.
4. **Dependency Discipline**:
   - **Never** install, remove, or upgrade dependencies (in `pom.xml` or `package.json`) without explicitly explaining the rationale and necessity to the user beforehand.
   - Stick to standard Spring Boot and React libraries whenever possible.
5. **Preserve Frontend API Contracts & Business Logic**:
   - Existing endpoints and DTO response shapes consumed by `frontend/src/services/api.js` must remain backward-compatible unless an intentional breaking change is planned and coordinated with the frontend.
   - Preserve existing features: dietary filtering (`isVeg`), 5-second duplicate order prevention, live preparation timers, digital receipt generation, and table liberation.
6. **No Unrelated Rewrites or Destructive Operations**:
   - Scope each change strictly to the user's immediate objective.
   - Never perform mass formatting, renaming sprees, or arbitrary refactors across files unrelated to the task.
   - Do not stage, commit, or push Git changes without explicit user instruction.
7. **Run Tests & Report Actual Results**:
   - After making changes to `backend/`, always run relevant tests (e.g. via `./mvnw test` or `.\backend\mvnw.cmd test`).
   - Report true test outcomes (run count, failures, errors, skips). Never fabricate or assume test results pass.

---

## 3. Strict Security & Multi-Tenancy Principles

1. **Zero Secret Leakage**:
   - **Never** print passwords, tokens, API keys, private certificates, or `.env` file contents in chat or logs.
   - Never commit plaintext secrets, database passwords, or JWT secrets to source code or version-controlled properties files.
2. **Server-Side Authentication Enforcement**:
   - Do not assume security works merely because a JWT utility or token string exists. Every private endpoint must be actively protected on the server side (e.g., via a Spring Security filter chain or authentication filter).
   - Reject unauthenticated requests with `401 Unauthorized`.
3. **Role-Based Access Control (RBAC)**:
   - Server-side routes must verify user roles:
     - `/api/manager/**` $\rightarrow$ `ADMIN` only.
     - `/api/kitchen/**` $\rightarrow$ `KITCHEN` or `ADMIN`.
     - `/api/waiter/**` $\rightarrow$ `WAITER` or `ADMIN`.
     - `/api/customer/**` $\rightarrow$ Public / Table Session Token access.
   - Reject unauthorized access attempts with `403 Forbidden`.
4. **Strict Multi-Restaurant Tenant Isolation**:
   - **NEVER trust client-supplied `restaurantId` query parameters or JSON body fields as proof of authorization for staff actions.**
   - Staff tenant identity must be extracted directly from the verified authentication token/principal (server-side context).
   - Every mutation and retrieval query for dishes, categories, tables, orders, and sales stats must verify that the target entity belongs to the authenticated user's restaurant (preventing Insecure Direct Object Reference - IDOR).
5. **Secure Cryptography & Password Storage**:
   - Use standard `BCryptPasswordEncoder` (or equivalent adaptive slow hashing algorithms) with automatic salting.
   - Never allow plaintext password matching fallbacks in authentication logic.
6. **Defensive Input Validation**:
   - Validate all DTO incoming payloads using Jakarta validation (`@Valid`, `@NotBlank`, `@NotNull`, `@Min`).
   - Handle errors gracefully via `@ControllerAdvice` returning uniform JSON error responses.

---

## 4. Product & Design Guidance

- If `PRODUCT.md` exists, treat its scope, user types, and product principles as binding authority.
- If `DESIGN.md` exists, honor its visual tokens, component guidelines, and aesthetic boundaries.
- Do not invent hypothetical features (such as loyalty points, delivery logistics, or third-party gateways) unless explicitly requested by the user.
