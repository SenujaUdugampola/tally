# Tally Project Status

**Assessment date:** 2026-10-15
**Repository:** `SenujaUdugampola/tally`  
**Current branch:** `master`  
**Current HEAD:** `bd72e98` (`dashboard api`)
**Working tree:** Clean; all current work is committed.

## Executive summary

Tally is an early-stage expense-sharing web application. The project has a working
application foundation: Next.js App Router, Clerk authentication, Convex
integration, a first-pass expense/group/settlement schema, shared UI primitives,
contacts and group-management UI, initial dashboard data queries, and an Inngest
route/function scaffold.

The product is not feature-complete yet. The public home page is still a
placeholder, the dashboard route is currently only a placeholder component, and
the Convex schema still lacks complete expense and settlement workflows. Contacts
and group creation are now wired through the UI and Convex, while dashboard
queries exist for balances, spending, and groups. The current production build
still fails during prerendering because the authentication/client provider path
uses runtime navigation data without the required Suspense boundary.

## What the project is

The stated product goal is a platform for sharing expenses with friends and
family. The intended domain model supports:

- User accounts synchronized from Clerk into Convex.
- One-to-one and group expenses.
- Equal, percentage, or exact split types.
- Group membership with admin/member roles.
- Settlements between users, optionally tied to expenses and groups.

## Technology stack

- **Frontend:** Next.js `16.4.0`, React `19.3.0`, App Router.
- **Styling/UI:** Tailwind CSS v4, `tw-animate-css`, shadcn-style UI components,
  Lucide icons, `next-themes` dependency.
- **Authentication:** Clerk via `@clerk/nextjs`.
- **Backend/database:** Convex `1.46.0`.
- **Background/event scaffold:** Inngest `4.23.0`.
- **Language:** JavaScript/JSX, with generated Convex type declarations.
- **Build tooling:** Turbopack, React Compiler, ESLint 9.

## Current architecture

### Application shell

- [`app/layout.js`](./app/layout.js) defines the root layout, metadata, Inter
  font, Clerk provider, Convex provider, global header, and main content area.
- [`components/ConvexClientProvider.jsx`](./components/ConvexClientProvider.jsx)
  creates the Convex client from `NEXT_PUBLIC_CONVEX_URL` and connects it to
  Clerk auth.
- [`components/header.jsx`](./components/header.jsx) provides:
  - Tally branding and home navigation.
  - Feature/how-it-works anchors on the root path.
  - Sign-in/sign-up controls for unauthenticated users.
  - User controls and a dashboard link for authenticated users.
  - A loading bar while the current user is synchronized.
- [`app/(main)/dashboard/page.jsx`](./app/(main)/dashboard/page.jsx) defines the
  authenticated dashboard route, but currently renders placeholder content.
- [`hooks/useStoreUser.jsx`](./hooks/useStoreUser.jsx) calls the Convex
  `users.store` mutation after authentication.
- [`app/(main)/contacts/page.jsx`](./app/(main)/contacts/page.jsx) is a client
  route that renders contacts and groups, with loading, empty, and populated
  states.

### Authentication

- Clerk sign-in and sign-up pages exist under
  [`app/(auth)/`](./app/(auth)/).
- [`convex/auth.config.js`](./convex/auth.config.js) configures Convex to trust
  Clerk.
- The user synchronization mutation is implemented in
  [`convex/users.js`](./convex/users.js).
- [`convex/users.js`](./convex/users.js) also contains a current-user query and
  an unfinished user-search query intended to support contacts.

### Data model

[`convex/schema.js`](./convex/schema.js) defines four tables:

1. **`users`** — Clerk token identifier, name, email, and optional image URL.
2. **`expenses`** — description, amount, category, date, payer, split type,
   participant splits, optional group, and creator.
3. **`groups`** — name, description, creator, and member records with roles and
   join timestamps.
4. **`settlements`** — amount, note, date, payer, receiver, optional group,
   related expense IDs, and creator.

Indexes and search indexes are present for common user/group/date access patterns.
[`convex/contacts.js`](./convex/contacts.js) provides the contacts/group query
and group-creation mutation used by the contacts UI. The implementation is
functional at the current prototype level but still needs authorization,
pagination, and broader validation before it is production-ready.

### UI and event scaffolding

- Reusable UI components are present in [`components/ui/`](./components/ui/).
- The contacts route is being wired to Convex through
  [`hooks/useConvexQuery.jsx`](./hooks/useConvexQuery.jsx).
- [`convex/dashboard.js`](./convex/dashboard.js) provides initial queries for
  one-to-one balances, annual spending, monthly spending, and groups with
  calculated balances.
- The contacts page includes a create-group modal that searches users and
  submits group membership through Convex.
- `sonner` is mounted through the root layout for application notifications,
  but no completed contacts/group interaction currently uses it.
- [`app/api/inngest/route.js`](./app/api/inngest/route.js) exposes Inngest
  `GET`, `POST`, and `PUT` handlers.
- [`lib/inngest/functions.js`](./lib/inngest/functions.js) contains a sample
  `app/task.created` function that returns a processed task after a one-second
  pause. It is not connected to expense workflows.
- [`app/globals.css`](./app/globals.css) contains the Tailwind/shadcn theme and
  light/dark design tokens.

## Implemented versus incomplete

### Implemented

- Next.js application shell and root navigation.
- Clerk provider and sign-in/sign-up routes.
- Convex client/provider integration.
- Authenticated user persistence in Convex.
- Initial expense-sharing schema and indexes.
- Initial contacts query and group-creation backend/API flow.
- Contacts route with rendered users/groups, empty states, loading state, and
  create-group modal.
- Initial dashboard balance/spending/group query API.
- Inngest endpoint and example function scaffold.
- A set of reusable form, layout, and interaction UI primitives.

### Incomplete or not yet evidenced

- The root page [`app/page.js`](./app/page.js) only renders placeholder “Sub”
  content and a destructive button.
- The dashboard route exists, but currently renders only `DashboardPage`
  placeholder content and is not connected to the dashboard queries.
- Contacts and group creation work in the prototype UI, but the flow still lacks
  invitation management, edit/delete operations, pagination, and comprehensive
  authorization/error UX.
- Dashboard query coverage is incomplete and needs validation against real
  expense/settlement data before being treated as a stable business API.
- No expense creation, editing, listing, deletion, or split-calculation UI.
- No group creation, invitation, membership-management, or group view flow.
- No settlement creation, balance calculation, or payment tracking flow.
- No complete Convex queries/mutations for expenses or settlements; group
  creation/query support is only partially complete.
- No visible landing-page features/how-it-works sections matching the header
  anchors.
- No automated application tests are present in the project inventory.
- The default README still contains the Create Next App template text rather
  than project-specific setup and product documentation.

## Validation performed

### ESLint

Command: `npm run lint`

Result: **Passes with 6 warnings and 0 errors** on the current working tree.

Warnings are primarily generated Convex-file disable directives plus an
anonymous default export warning in [`convex/auth.config.js`](./convex/auth.config.js).

### Production build

Command: `npm run build`

Result: **Fails during prerendering.**

The current failure is on `/sign-in/[[...sign-in]]`. Next.js reports that runtime
URL data from `usePathname()` is reached through the client authentication/provider
path outside a Suspense boundary. The relevant path is:

`app/(auth)/sign-in/[[...sign-in]]/page.jsx` → root layout →
`ConvexClientProvider` → `useStoreUser`/client navigation context.

The build also reports that the `middleware` convention is deprecated and should
eventually migrate to `proxy`, but that warning is not the build-stopping error.

## Environment requirements

The local environment defines these variable names:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `CLERK_FRONTEND_API_URL`
- `INNGEST_DEV`

Secret values should remain local or be supplied through the deployment
environment; they should not be committed.

## Recommended next steps

### Priority 1: restore a passing production build

Resolve the Suspense boundary issue around the client-only header/navigation
behavior, then rerun `npm run build`. Keep the auth routes and global header
behavior intact while ensuring runtime navigation hooks are rendered beneath the
appropriate boundary.

### Priority 2: turn the dashboard API into a usable product flow

Replace the dashboard placeholder with a protected, query-backed experience:

1. Display one-to-one balances and spending summaries.
2. Create an expense.
3. Select participants and calculate equal/exact/percentage splits.
4. Persist and list expenses through Convex.
5. Display group balances and record a settlement.

### Priority 3: finish contacts and group scaffolding

- Add bounded/paginated, authorization-safe user search.
- Add group invitation, editing, membership-management, and group detail flows.
- Improve mutation error handling and success feedback in the group modal.
- Validate the new Convex functions and regenerate/check generated API output as
  part of the normal Convex workflow.

### Priority 4: complete backend behavior

Add validated Convex queries and mutations for expenses, groups, and settlements.
Every function should derive the current user from Convex auth and enforce
ownership/membership checks before reading or writing group-scoped data.

### Priority 5: product readiness

- Replace the placeholder home page with the intended landing page.
- Add group management and invitations.
- Connect Inngest to a real asynchronous workflow only when a product use case
  requires it.
- Add focused tests for split calculations, authorization, balance calculation,
  and settlement behavior.
- Replace the template README with project-specific local development,
  environment, Convex, Clerk, and deployment instructions.

## Overall status

**Foundation:** Partially complete; contacts/groups and dashboard API are wired
**Authentication:** Wired, pending production-build fix  
**Data model:** Initial schema complete; contacts/groups API partial and expense/settlement API absent
**Frontend product experience:** Prototype; contacts route usable, dashboard placeholder
**Background processing:** Scaffold only  
**Production readiness:** Not ready
