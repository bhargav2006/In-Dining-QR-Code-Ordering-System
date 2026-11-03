# Restaurant QR Ordering System — Agent Instructions

## 1. Project Objective

Build a completely new, production-quality frontend for the existing Restaurant QR Ordering System.

The original application is preserved inside the external backup directory:

`D:\DevSpace\Restaurant-QR-Ordering-System-backup`

The active project workspace is:

`D:\DevSpace\Restaurant-QR-Ordering-System`

The existing backend is located inside the active workspace:

`D:\DevSpace\Restaurant-QR-Ordering-System\backend`

The new frontend will be developed independently inside:

`D:\DevSpace\Restaurant-QR-Ordering-System\frontend-v2`

The existing backend is the source of truth for application functionality and API contracts.

## 2. Project Boundaries

- Treat the backup directory `D:\DevSpace\Restaurant-QR-Ordering-System-backup` as strictly READ-ONLY.
- Never delete, rename, move or overwrite anything inside `D:\DevSpace\Restaurant-QR-Ordering-System-backup`.
- Never modify existing backend source files inside `backend/`.
- Never change database schemas, API endpoints, authentication or backend business logic.
- Build all new frontend application code inside `frontend-v2/`.
- Shared documentation belongs inside `docs/`.
- Project-specific AI skills belong inside `.agents/skills/`.
- Do not modify the master Global Design System at `D:\DesignSystems\Global-Design-System` (READ-ONLY).

## 3. Mandatory Investigation

Before implementing the frontend:

- Inspect the entire backup project.
- Identify the actual backend and frontend directories.
- Understand the Spring Boot backend architecture.
- Inspect controllers, services, DTOs, repositories, entities and security.
- Identify actual API endpoints and response formats.
- Verify authentication and role permissions.
- Identify existing QR ordering, menu, cart, order and admin capabilities.
- Separate verified features from incomplete or unavailable features.

Never invent API endpoints or application functionality.

Document verified findings in `docs/architecture/`.

## 4. Frontend Architecture

- Use React with Vite for the new frontend unless the investigation identifies a concrete compatibility issue.
- Use a clean, maintainable component architecture.
- Separate pages, shared components, layouts, hooks, services and utilities.
- Keep API calls in a dedicated service layer.
- Centralise API configuration and environment variables.
- Use reusable components instead of duplicating page-specific implementations.
- Use clear naming conventions.
- Avoid unnecessary dependencies.
- Keep business logic separate from presentation logic.
- Do not build everything inside a single component.

## 5. Design Quality

Use the installed frontend design, UI/UX and design-system skills.

The result must have a distinctive hospitality-product identity.

Avoid generic AI-generated visual patterns:

- Repetitive rounded cards everywhere.
- Excessive glassmorphism.
- Unnecessary gradients.
- Decorative dashboard elements without purpose.
- Random floating animations.
- Oversized empty hero sections.
- Generic stock-looking layouts.
- Arbitrary typography and colour combinations.
- Excessive shadows and borders.

Design each screen around its actual user and task.

Customer ordering should prioritise mobile usability, menu discovery and a frictionless ordering process.

Restaurant staff and admin interfaces should prioritise operational clarity, information density and fast interactions.

## 6. Global Design System

Use the master design system at:

`D:\DesignSystems\Global-Design-System`

Preserve the approved:

- Verdant Signal Light theme.
- Obsidian & Forest Dark theme.
- Semantic colour tokens.
- Typography and visual hierarchy.
- Component colour definitions.

Copy only the required assets into the new frontend when necessary.

Never create an unrelated brand palette.

## 7. API Integration

- Use only verified backend contracts.
- Respect the existing authentication mechanism.
- Handle loading, success, empty and error states.
- Keep sensitive credentials out of frontend source code.
- Do not hardcode environment-specific API URLs.
- Preserve backend compatibility.
- Never simulate successful API operations when a real backend operation fails.

## 8. Responsive Design

Design and verify:

- Mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.

Customer ordering must be mobile-first.

Admin and staff interfaces must adapt intelligently to smaller displays.

Prevent horizontal page overflow, clipped content and overlapping controls.

## 9. Motion and Interaction

Use subtle, intentional animations.

Prioritise meaningful transitions, feedback, loading states and interaction clarity.

Do not blindly copy the portfolio's 3D ribbon background into the restaurant application.

Choose motion appropriate to restaurant operations and customer ordering.

Respect reduced-motion preferences.

## 10. Editing Workflow

- Prefer direct workspace file-editing operations.
- Make focused, reviewable changes.
- Avoid creating temporary scripts just to rewrite project files.
- Use terminal commands for package installation, development servers, tests and builds.
- Never write project changes through scripts stored in Gemini or Antigravity application-data directories.
- Review diffs after significant changes.
- Keep unrelated files untouched.

## 11. Quality Assurance

Use the available browser-testing and UI-review skills.

Test real user flows, not just screenshots.

Verify authentication, navigation, ordering, cart operations and administrative workflows where supported by the backend.

Run production builds and resolve console errors.

## 12. Working Discipline

Work in documented phases.

During investigation-only tasks, do not implement application code.

Before major architecture changes, explain the proposed approach.

Maintain:

- PRODUCT.md
- docs/DESIGN_BRIEF.md
- docs/architecture/PROJECT_AUDIT.md
- docs/architecture/API_CONTRACT.md
- docs/planning/IMPLEMENTATION_PLAN.md

Update documentation when verified implementation decisions change.

Never claim that something has been tested unless it was actually tested.
