# Tally Project Status

**Assessment date:** 2026-10-26
**Repository:** `SenujaUdugampola/tally`  
**Current branch:** `master`  
**Current HEAD:** `3017e78` (`expense api`)
**Working tree:** Contains uncommitted contacts/group UI changes and an
in-progress, currently empty expense-creation route/component scaffold. The
status document itself is also being updated.

## Executive summary

Tally is an early-stage expense-sharing web application. The project has a working
application foundation: Next.js App Router, Clerk authentication, Convex
integration, a first-pass expense/group/settlement schema, shared UI primitives,
contacts and group-management UI, a query-backed dashboard with spending and
balance views, one-to-one and group detail pages, shared expense/settlement
record components, group expense aggregation, a Convex expense-creation
mutation, and an Inngest route/function scaffold.

The product is not feature-complete yet. The public home page remains a
placeholder, the expense-creation UI is only a scaffold, settlement creation is
not implemented, and the detail pages still require broader authorization and
correctness validation. The newest Convex expense/group functions are not yet
covered by automated tests or a complete end-to-end creation flow.

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
  authenticated dashboard route and renders balance cards, spending summaries,
  a monthly chart, groups, recent activity, and quick actions. The quick actions
  currently target routes whose creation pages do not yet exist.
- [`hooks/useStoreUser.jsx`](./hooks/useStoreUser.jsx) calls the Convex
  `users.store` mutation after authentication.
- [`app/(main)/contacts/page.jsx`](./app/(main)/contacts/page.jsx) is a client
  route that renders contacts and groups, with loading, empty, and populated
  states. Friend and group cards navigate to their corresponding detail routes.
- [`app/(main)/person/[id]/page.jsx`](./app/(main)/person/[id]/page.jsx) renders
  a one-to-one profile, net balance, and tabbed expense/settlement history.
- [`app/(main)/groups/[id]/page.jsx`](./app/(main)/groups/[id]/page.jsx) renders
  group details, member balances, and tabbed group expenses/settlements.

### Authentication

- Clerk sign-in and sign-up pages exist under
  [`app/(auth)/`](./app/(auth)/).
- [`convex/auth.config.js`](./convex/auth.config.js) configures Convex to trust
  Clerk.
- The user synchronization mutation is implemented in
  [`convex/users.js`](./convex/users.js).
- [`convex/users.js`](./convex/users.js) also contains a current-user query and
  a search query used by the contacts/group member picker.

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
  one-to-one balances, annual spending, monthly spending, groups with calculated
  balances, and recent activity.
- [`convex/expenses.js`](./convex/expenses.js) provides a one-to-one expense and
  settlement lookup, expense deletion, and a first-pass `createExpense`
  mutation. The mutation validates group membership and split totals but still
  needs stronger authorization and input validation.
- [`convex/groups.js`](./convex/groups.js) contains a group expense,
  settlement, member, and balance aggregation query, but this implementation has
  only been validated at build/lint level and still needs representative data
  testing.
- [`components/expenseList.jsx`](./components/expenseList.jsx) and
  [`components/settlementList.jsx`](./components/settlementList.jsx) provide
  shared record cards for person and group detail pages.
- The contacts page includes a create-group modal that searches users and
  submits group membership through Convex. The modal is currently being moved
  from the underscored components directory into `contacts/components/`.
- The new expense route exists at
  [`app/(main)/expenses/new/page.jsx`](../app/(main)/expenses/new/page.jsx),
  with placeholder component files for category, group, participant, split,
  and expense-form selection. These files are currently empty, so no expense
  creation UI is usable yet.
- `sonner` is mounted through the root layout and is used by the group-creation
  flow for success/error feedback.
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
- Dashboard balance/spending/group/recent-activity query API.
- Dashboard route with balance cards, spending chart, group summaries, recent
  activity, and quick-action controls.
- Initial one-to-one expense lookup, balance calculation, and expense deletion
  mutation.
- First-pass Convex `createExpense` mutation with equal/exact/percentage split
  type storage, split-total tolerance, and group-membership checking.
- Group expense/settlement/member/balance aggregation query and group detail
  page.
- Person detail page with separate expense and settlement views.
- Shared expense and settlement record components.
- Contacts card navigation to person and group detail routes.
- Inngest endpoint and example function scaffold.
- A set of reusable form, layout, and interaction UI primitives.

### Incomplete or not yet evidenced

- The root page [`app/page.js`](./app/page.js) still contains placeholder
  content and a destructive button rather than the intended finished landing
  page.
- The dashboard reads live Convex queries, but expense and settlement creation
  actions do not yet provide a complete usable flow. The new expense route and
  its selector/form components are currently empty scaffolding.
- Contacts and group creation work in the prototype UI, but the flow still lacks
  invitation management, edit/delete operations, pagination, and comprehensive
  authorization/error UX.
- Dashboard, person, and group balance calculations need validation against
  representative expense/settlement data before being treated as stable APIs.
- No usable expense creation, editing, listing, or split-calculation UI;
  deletion and the first-pass `createExpense` mutation are present, but the
  frontend form is not implemented.
- No settlement creation, listing, or payment-tracking UI.
- No group invitation or membership-management flow.
- Convex expense/group functions are partial and need validator, authorization,
  pagination, and correctness work before production use.
- No visible landing-page features/how-it-works sections matching the header
  anchors.
- No automated application tests are present in the project inventory.
- Current uncommitted changes move the create-group modal, adjust contacts and
  dashboard imports, and revise group-page balance calculations; these changes
  still need validation before being treated as stable.
- The default README still contains the Create Next App template text rather
  than project-specific setup and product documentation.

## Validation performed

### ESLint

Command: `npm run lint`

Result: **Passes with 6 warnings and 0 errors** on the current tree. The
warnings are the same generated-file disable directives and anonymous default
export warning described below.

Warnings are primarily generated Convex-file disable directives plus an
anonymous default export warning in [`convex/auth.config.js`](./convex/auth.config.js).

### Production build

Command: `npm run build`

Result: **Passes.**

The build includes the dynamic `/expenses/new`, `/groups/[id]`, and
`/person/[id]` routes successfully. Next.js reports that the `middleware`
convention is
deprecated and should eventually migrate to `proxy`, but this is a warning and
not a build-blocking error.

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

### Priority 1: complete expense creation end to end

Implement the new expense route and its empty selector/form components. Connect
them to `convex.expenses.createExpense`, support participant selection and
equal, exact, and percentage split calculation, and add validation and
user-facing error handling. Then implement settlement creation.

### Priority 2: validate financial calculations

Test the dashboard, person, and group calculations with representative seeded
data:

1. Verify one-to-one and group balances.
2. Verify settlements reduce/increase balances in the correct direction.
3. Verify monthly and annual spending totals.
4. Add focused automated tests for split and balance behavior.

### Priority 3: finish contacts and group scaffolding

- Add bounded/paginated, authorization-safe user search.
- Add group invitation, editing, and membership-management flows.
- Improve mutation error handling and success feedback in the group modal.
- Validate the new Convex functions and regenerate/check generated API output as
  part of the normal Convex workflow.

### Priority 4: complete backend behavior

Complete and validate Convex queries and mutations for expenses, groups, and settlements.
Every function should derive the current user from Convex auth and enforce
ownership/membership checks before reading or writing group-scoped data.
Review the new expense/group aggregation logic for runtime correctness and add
focused tests before exposing it as a stable API.

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

**Foundation:** Partially complete; contacts, dashboard, person, and group UI/API are wired, with expense API scaffolding added
**Authentication:** Wired; production build passes with a middleware deprecation warning
**Data model:** Initial schema complete; contacts/groups and partial expense/settlement API present, including first-pass expense creation
**Frontend product experience:** Prototype; dashboard, contacts, person, and group views are usable, while expense/settlement creation flows remain incomplete
**Background processing:** Scaffold only  
**Production readiness:** Not ready
