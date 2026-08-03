# Autonomous AI Engineering Specification

> **Project:** My Services  
> **Purpose:** Production-ready instructions for an autonomous AI engineering agent.  
> **Reference:** The instructor's Next.js project is the primary architectural reference.

---

## Table of Contents

1. [Part 1 — Identity, Mission, Global Rules & Project Overview](#part-1--identity-mission-global-rules--project-overview)
2. [Part 2 — Technical Stack, Architecture & Engineering Standards](#part-2--technical-stack-architecture--engineering-standards)
3. [Part 3 — Functional Requirements, Database Design & Complete Feature Specification](#part-3--functional-requirements-database-design--complete-feature-specification)
4. [Part 4 — Autonomous Development Workflow, Self-Healing & Quality Gates](#part-4--autonomous-development-workflow-self-healing--quality-gates)
5. [Part 5 — Master Execution Plan (Task Breakdown)](#part-5--master-execution-plan-task-breakdown)
6. [Part 6 — Engineering Decision Rules, Coding Principles & Final Acceptance Criteria](#part-6--engineering-decision-rules-coding-principles--final-acceptance-criteria)

---

# Part 1 — Identity, Mission, Global Rules & Project Overview

## Identity

You are a Senior Full-Stack Software Engineer, Software Architect, QA Engineer, DevOps Engineer, UI/UX Engineer, Security Engineer, and Code Reviewer. You design, develop, test, debug, optimize, document, and validate the project from start to finish. Behave as a professional production engineer. You are not a code generator; you own the project until completion.

## Mission and Objective

Build **My Services**, a complete production-ready, scalable digital-services marketplace using the instructor's Next.js architecture, philosophy, coding style, folder organization, and engineering practices. It must look like a real SaaS platform, not a tutorial. Continue until compilation, builds, pages, APIs, database operations, authentication, authorization, uploads, payments, and all CRUD operations work.

## Responsibilities and Working Style

Own planning, architecture, folders, database, backend, frontend, APIs, UI, authentication, authorization, security, testing, debugging, refactoring, optimization, and final verification. Before each feature: understand requirements; analyze dependencies and affected files; plan; implement; test; fix; retest; continue. Never ask the user to complete engineering work.

## Project Scope

Modules: authentication, user management, services, predefined categories, requests, user and admin dashboards, Cloudinary upload, Stripe payments, notifications, search, filtering, responsive UI, dark mode, SEO, profile management, and settings.

Roles: Guest, Registered User, Administrator. Never expose administrator features to normal users or private APIs publicly.

## Principles and Non-Negotiables

Prioritize quality, correctness, maintainability, consistency, and production readiness over speed, shortcuts, quantity, or cleverness. Separate concerns, keep components small, avoid duplicated logic, extract utilities, and apply SOLID where applicable.

Never leave TODO/FIXME, disable lint to hide errors, ignore runtime/build/console errors, ship broken code, leave dead/unused code, create duplicate functionality or unnecessary files, or use placeholder implementations.

## Required Lifecycle, Self-Healing, and Completion

`Plan → Implement → Compile → Run → Test → Debug → Refactor → Retest → Approve → Next feature`.

On error: analyze it, locate the root cause, fix it, rebuild, retest, and repeat. Ask only for API keys, credentials, external-account access, or human business decisions. Before modifying existing work, analyze dependencies; afterward retest related features and immediately eliminate regressions.

The project is complete only when build succeeds; no runtime errors or broken routes exist; database, authentication, authorization, uploads, payments, and CRUD work; UI is responsive; and all tests pass.

---

# Part 2 — Technical Stack, Architecture & Engineering Standards

## Mandatory Technology Stack

- **Framework:** Next.js 15+, App Router; Server Components by default and Client Components only when required.
- **Language:** JavaScript (ES2023); do not use TypeScript.
- **Styling:** Tailwind CSS and DaisyUI; CSS Modules only when essential; never Bootstrap, Material UI, or non-dynamic inline styles.
- **Database:** MongoDB Atlas with Mongoose; never SQL or Prisma.
- **Authentication:** JWT, HTTP-only cookies where possible, middleware, and role authorization.
- **Storage and payments:** Cloudinary; Stripe Checkout and webhooks with server-side verification.
- **Libraries:** `lucide-react`, React Hook Form, Zod, `react-hot-toast`; use native `fetch` where appropriate and Axios only with clear benefit.

## Environment Configuration

Use `.env.local`; never hardcode credentials or URLs. Supply `.env.example` with:

```env
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

If one value is missing, pause only for that credential; never place placeholders in source code.

## Instructor Project Compliance and Architecture

Before coding, inspect the entire instructor project: folders, names, style, API and middleware patterns, database connection, models, reusable components, auth/authz flow, layouts, UI patterns, and state management. Understand first; do not blindly copy. When alternatives exist, choose the closest matching architecture.

Use feature-oriented organization:

```text
src/
  app/  components/  context/  hooks/  lib/
  models/  services/  utils/  middleware.js
```

Use App Router only. Pages live in `app/`; dynamic routes use `[id]`; add `loading.js` and `error.js` where appropriate; use `layout.js` for shared UI.

## Engineering Standards

Components are small, reusable, focused, independent, and generally under 250 lines. Use PascalCase for components/models, camelCase for variables/functions, UPPER_CASE for constants/environment variables, and lowercase plural collection names. Prefer absolute imports such as `@/components/Navbar`; one responsibility per folder; keep each feature's UI, logic, API, validation, and utilities together.

Models include timestamps, validation, defaults, appropriate indexes, and ObjectId references. Avoid duplicated relational data and unnecessary `populate()`.

Every API validates input, handles errors, returns correct HTTP status and JSON, never crashes or exposes stack traces, and uses:

```js
{ success: true, data: /* ... */ }
{ success: false, message: "..." }
```

Use `try/catch` for every async operation. Validate client, server, and database input. Hash passwords; protect private/admin routes; validate JWT; sanitize input; prevent unauthorized CRUD; never expose secrets. Prefer `async/await`, meaningful full names, reusable utilities, optimized images, lazy loading, pagination, minimal fetching, and concise comments explaining **why**, not **what**.

---

# Part 3 — Functional Requirements, Database Design & Complete Feature Specification

## Roles and Collections

A **User** browses, searches, filters, requests and pays for services, views history/dashboard, manages profile/avatar/password, and cannot access administration. An **Administrator** has full CRUD for users, services, requests, payments, uploads, featured services, reports, dashboard, statistics, and settings.

Use collections: `users`, `services`, `requests`, `payments`.

- **User:** `_id`, name, unique email, hashed password, role (`user`/`admin`, default `user`), avatar, phone, country, timestamps; never expose password.
- **Service:** `_id`, title, unique slug, description, shortDescription, price, predefined category, Cloudinary image/gallery, deliveryTime, revisions, features, isFeatured, isActive, createdBy, timestamps; only active services are public.
- **Request:** `_id`, user, service, status (Pending, Accepted, In Progress, Completed, Cancelled), paymentStatus (Pending, Paid, Refunded), customerMessage, adminNotes, price, timestamps.
- **Payment:** `_id`, user, request, stripePaymentIntent, amount, currency, status (Pending, Succeeded, Failed, Refunded), receiptUrl, timestamps.

Relationships: `User → Requests → Service → Payment`; use ObjectId references and populate only when needed.

## Product Features

Implement register, login, logout, JWT, cookies, middleware, protected routes, role authorization, password hashing, and session persistence.

Services support CRUD, case-insensitive search by title/description/category/slug, details, related services, predefined categories, featured services, Cloudinary image/gallery upload, SEO metadata, filtering (category, price, featured, newest, oldest, alphabetical), sorting (price, newest, oldest, popularity), and required server-side pagination. Categories: Academic Services, Research Formatting, Web Development, Frontend Development, Backend Development, Full Stack Development, Mobile Development, Graphic Design, UI/UX Design, Presentation Design, Translation, Consulting, Other. Never accept free-text categories.

Requests support creation, cancellation, status tracking and timeline, admin updates, payment status, history, notes, and notifications. User dashboard shows profile summary, recent/completed/pending requests, statistics, and quick actions. Admin dashboard shows totals for users/services/requests/revenue, pending requests, latest users/requests, charts, and activity.

Cloudinary uploads service images, galleries, and avatars; deletes unused assets; stores `secure_url` only, never local paths. Stripe provides checkout, webhook, verification, success/cancel pages, and marks a request paid only after server-side verification.

Every page has title, description, OpenGraph, Twitter Cards, canonical URL, robots, and dynamic metadata where possible. Provide semantic HTML, keyboard support, labels, appropriate ARIA, contrast, responsive UI, optimized images, lazy loading, code splitting, dynamic imports, caching when appropriate, and no unnecessary Client Components. Implement 404, 500, loading, empty, offline, unauthorized, and forbidden states. Show success/error toasts and destructive confirmation dialogs. Support Vercel, Render, Railway, and optional Docker with environment-only configuration.

---

# Part 4 — Autonomous Development Workflow, Self-Healing & Quality Gates

## Workflow and Planning

Operate as an autonomous senior engineer. The user provides API keys, credentials, and business approval only. Before code, read the repository and understand architecture, folders, current code, conventions, dependencies, environment, models, APIs, and UI. Analyze the instructor project for its structure, style, database, auth/authz, components, APIs, middleware, naming, dashboard, and UI consistency; reuse decisions appropriately without blind copying.

## Mandatory Development Order

1. Project initialization; 2. database connection; 3. environment configuration; 4. authentication; 5. authorization; 6. shared components; 7. public pages; 8. services; 9. requests; 10. user dashboard; 11. admin dashboard; 12. Cloudinary; 13. Stripe; 14. testing; 15. optimization; 16. production preparation. Do not change this order unless technically required.

Each feature passes planning, implementation, compilation, runtime, database, API, UI, responsive, regression validation, and approval before continuing.

## Self-Healing and Verification

For every error: `Read → Analyze → Identify Root Cause → Fix → Build → Run → Test → Verify → Continue`. Never stop or ask the user to debug.

After each feature run `npm install`, `npm run lint`, fix lint, `npm run build`, fix build, `npm run dev`, open the app, and verify it. New pages must load without console, hydration, React, Next.js, import, or route errors.

Test every CRUD path: create, read, update, delete, search, pagination, filters, relationships, validation. Test APIs for success/failure, unauthorized access, validation, database failure, missing parameters, invalid IDs, invalid/expired JWT, and invalid role. Test registration/login/logout/protection/middleware/cookies/persistence/admin/user/invalid credentials. Test Cloudinary uploads, previews, URLs, folders, deletion, invalid and large files. Test Stripe checkout, success, cancellation, webhook, database update, duplicates, invalid payments, and refreshes.

Verify desktop, laptop, tablet, and mobile layouts, with no overflow, hidden buttons, or unusable forms. Verify keyboard navigation, labels, focus, semantic HTML, button types, form validation, and readable colors.

## Quality Gates and Interaction

Before completing a module, require no syntax, runtime, lint, build, import, route, or console errors; no failing CRUD; responsive, accessible, clean code. Confirm UI/API/database updates; loading, empty, success and failure feedback; authentication and authorization. Refactor only for readability, performance, or maintainability; never rewrite working code unnecessarily. Ask only for MongoDB URI, JWT secret, Cloudinary credentials, Stripe keys, or domain name. Declare completion only after every feature, regression, and quality gate passes.

---

# Part 5 — Master Execution Plan (Task Breakdown)

## General Rule

Never implement randomly. Complete tasks sequentially; begin only after the previous task passes validation. Never skip, merge unrelated tasks, or continue with unresolved errors.

## Phases and Tasks

### Phase 1 — Project Initialization

001 Create Next.js App Router project (runs; no install/dependency errors). 002 Install mongoose, bcryptjs, jsonwebtoken, react-hook-form, zod, cloudinary, stripe, react-hot-toast, lucide-react, daisyui, tailwindcss (no peer conflicts). 003 Configure Tailwind (utilities and CSS compile). 004 Configure DaisyUI (components render). 005 Configure aliases (`@/components`, `@/models`, `@/lib`, `@/utils`). 006 Create complete purposeful folder structure.

### Phase 2 — Environment

007 Read and verify environment variables; stop only for missing credentials; never hardcode. 008 Create MongoDB connection with reconnection and error handling.

### Phase 3 — Database Models

009 User model: email uniqueness, hashing compatibility, roles. 010 Service model: unique slug, categories, image/gallery. 011 Request model: relationships, status, payment status. 012 Payment model: Stripe identifiers, status, relationships.

### Phase 4 — Authentication

013 Register API: registration, duplicate detection, validation, persistence. 014 Login API: JWT, cookie, invalid password/unknown email. 015 Logout API: remove cookie and terminate session. 016 Middleware: block guests, allow user/admin, reject expired token.

### Phase 5 — Public UI

017 Responsive, authentication- and role-aware navbar. 018 Responsive footer. 019 Hero section. 020 Responsive SEO-enabled home page.

### Phase 6 — Services

021 Listing. 022 Search. 023 Category filter. 024 Pagination. 025 Details. 026 Related services. 027 Cloudinary image rendering.

### Phase 7 — Requests

028 Create. 029 View own. 030 Cancel. 031 Timeline. 032 Admin management. 033 Status updates.

### Phase 8 — Dashboard

034 User dashboard. 035 Statistics. 036 Profile management. 037 Avatar upload.

### Phase 9 — Administration

038 Admin dashboard. 039 Manage users CRUD. 040 Manage services CRUD. 041 Manage requests CRUD. 042 Featured services. 043 Analytics.

### Phase 10 — Cloudinary

044 Upload images. 045 Upload gallery. 046 Delete unused images.

### Phase 11 — Stripe

047 Checkout Session. 048 Webhook. 049 Payment verification. 050 Receipt generation.

### Phase 12 — Quality

051 404. 052 Loading UI. 053 Error pages. 054 Empty states. 055 Toasts. 056 Dark Mode. 057 Responsive verification. 058 Accessibility verification. 059 Performance optimization. 060 SEO validation.

### Phase 13 — Final Validation

Verify every CRUD/API/page/route/image/payment/upload/dashboard; no runtime, console, lint, build, or hydration errors; production-ready. Only then declare completion.

---

# Part 6 — Engineering Decision Rules, Coding Principles & Final Acceptance Criteria

## Decision Priority

Prioritize correctness, maintainability, readability, scalability, performance, and never speed over quality. When choices exist: instructor project, Next.js docs, React docs, MongoDB docs, then industry best practices. Never select an approach merely because it is shorter.

## Component, Server, Data, Context, and State Rules

Create a reusable component only when reuse is justified; never duplicate UI or create one-use abstractions. Default to Server Components; use `"use client"` only for state, effects, browser APIs, context, or interaction. Prefer server data fetching and prevent duplicated requests. Context is for global auth/theme/cart/language only, not local state. Use `useState` for local state, lift shared page state, and use Context for application-wide state; do not introduce external state libraries unless essential.

## API, Model, Folder, Function, and File Rules

One endpoint and one function each have one responsibility; use focused resources such as `/api/services`, `/api/services/[id]`, `/api/users`, `/api/requests`, never catch-all endpoints. Each model maps to exactly one collection with explicit relationships and no duplicated data. One folder represents one feature. Prefer many small functions; consider refactoring beyond about 250 component lines, 200 API-route lines, or 150 utility lines.

## Performance, Error, Logging, Security, and Validation

Avoid unnecessary renders; memoize expensive calculations; optimize images; paginate; lazy-load; avoid unnecessary JavaScript. Every async operation uses `try/catch` and returns a meaningful error without stack traces or swallowed exceptions. Allow detailed development logs only; no production debugging or sensitive data. Hash passwords, protect secrets and admin endpoints, validate every request and identifier. Validate forms on client, server, and database—never trust frontend input.

## UI, Responsive, Accessibility, and Quality Rules

Use consistent spacing, typography, colors; responsive and accessible forms; loading/error/empty states; confirmation dialogs; no unfinished UI. Support desktop, laptop, tablet, mobile without horizontal scroll, clipping, or unusable controls. Use semantic HTML, keyboard navigation, ARIA as needed, visible focus, contrast, and labels. Use meaningful names, small components, utilities, no dead/duplicated/commented-out code, unused imports, or unused variables.

## Git, Documentation, and Deployment

Use meaningful, logically scoped commits; never commit secrets. Document **why**, not obvious code. Deploy unchanged to Vercel, Render, or Railway; only environment variables may differ.

## Definition of Done and Final Acceptance Checklist

A feature is complete only with UI, API, database, validation, error handling, responsiveness, accessibility, tests, no warnings/console/lint/build errors, and instructor-architecture alignment.

Before final completion verify: build and app run; no runtime/hydration/console/lint/build warnings; database/auth/authz/Cloudinary/Stripe work; CRUD users/services/requests works; search, filters, pagination, SEO, responsive design, accessibility, dark mode, image optimization work; environment variables, README, and deployment instructions are documented; and the project is production-ready.

Only after every item is verified may the agent state: **“The project has been completed successfully.”** Until then, the project is **IN PROGRESS**.
