# VT Annotator

## Root Directory Structure

| File/Folder | Purpose                                                              |
|-------------|----------------------------------------------------------------------|
| /backend    | Complete Node.js/Express API service. Handles all API, business logic, authentication, and database interaction. |
| /frontend   | Complete React/Vite UI application. Handles all user interfaces (Dashboards, Annotation Tool). |
| .gitignore  | Specifies files to ignore (e.g., node_modules).                      |
| README.md   | Main entry point documentation.                                      |

---

## ⚙️ Module Structure: /backend (Node.js/Express)

The backend must follow the Model-View-Controller (MVC) pattern to ensure clear separation between database logic, business logic, and API routes.

| Folder                | Purpose & Content                                                              | Example Files                               |
|-----------------------|--------------------------------------------------------------------------------|---------------------------------------------|
| **/src**              | All main application source code resides here.                                 |                                             |
| ├── **/config**       | Environment settings, database connection setup.                               | `database.ts`, `jwt.ts`                     |
| ├── **/controllers**  | Business Logic & Request Handlers. Functions that execute after a route is matched (e.g., `createUser`, `createProject`). | `authController.ts`, `projectController.ts` |
| ├── **/middleware**   | Functions executed before controllers (Authentication, Authorization).         | `authMiddleware.ts`, `adminCheck.ts`        |
| ├── **/models**       | Database interaction layer (e.g., Drizzle/ORM files, or pg query functions).   | `userModel.ts`, `imageModel.ts`             |
| ├── **/routes**       | API Route Definitions. Maps HTTP methods and paths to controllers (e.g., `router.post('/login', authController.login)`). | `authRoutes.ts`, `dataSpecialistRoutes.ts`  |
| ├── **/services**     | Complex business logic that might be shared across controllers (e.g., API Key generation). | `apiKeyService.ts`, `progressService.ts`    |
| └── **server.ts**     | Entry Point. Sets up Express, middleware, and loads all routes.                |                                             |

---

## 🖼️ Module Structure: /frontend (React/Vite)

The frontend should be structured around the concept of role-based pages and reusable components.

| Folder                      | Purpose & Content                                                              | Example Files                             |
|-----------------------------|--------------------------------------------------------------------------------|-------------------------------------------|
| **/src**                    | All main application source code resides here.                                 |                                           |
| ├── **/api**                | Centralized functions for calling the backend REST API.                        | `authService.ts`, `projectApi.ts`         |
| ├── **/components**         | Reusable UI elements (Buttons, Cards, Forms).                                  | `Button.tsx`, `ProjectCard.tsx`           |
| ├── **/layouts**            | Wrappers for common page structure (e.g., navigation bar, sidebar, footer).    | `MainLayout.tsx`, `Sidebar.tsx`           |
| ├── **/pages**              | Main Application Views. Structured by role for clarity.                        |                                           |
| │   ├── **/admin**          | Admin Dashboard pages.                                                         |                                           |
| │   ├── **/data-specialist**| Data Specialist Dashboard pages.                                               |                                           |
| │   ├── **/annotator**      | Annotator tool interface.                                                      |                                           |
| │   └── **/auth**           | Login/Register pages.                                                          |                                           |
| ├── **/hooks**              | Custom React hooks for state and logic management.                             | `useAuth.ts`, `useProjectStatus.ts`       |
| └── **App.tsx**             | Root Component. Handles routing and layout initialization.                     |                                           |
