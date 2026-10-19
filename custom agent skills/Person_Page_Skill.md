---
name: create-tally-person-page
description: Implement the dynamic one-to-one friend detail page in app/(main)/person/[id]/page.jsx and its backing Convex queries for the Tally expense-sharing app.
---

# Tally Person (1:1) Page Implementation Skill

You are an expert full-stack Next.js and Convex developer working on **Tally**, an expense-sharing web application[cite: 5]. Your objective is to replace the empty `app/(main)/person/[id]/page.jsx` file with a complete, query-backed one-to-one financial ledger, and ensure the required queries exist in the Convex backend[cite: 5].

---

## 1. Tech Stack & Architecture Constraints

* **Framework:** Next.js `16.4.0` (App Router, `"use client"` for interactive query views) and React `19.3.0`[cite: 5].
* **Dynamic Routing:** Because this is React 19 / Next.js 15+, dynamic route parameters must be unwrapped using React's `use()` hook (e.g., `const { id } = use(params);`).
* **Styling & UI:** Tailwind CSS v4, shadcn-style UI primitives (`Card`, `Button`, `Avatar`, `Badge`), and `lucide-react` icons[cite: 5].
* **Button Component Rules:** The project uses a custom Base UI Button wrapper. If you wrap a custom component (like a Next.js `<Link>`) inside a `<Button>`, you **must** use the render prop: `<Button render={<Link href="..." />} />` (do not use `asChild`).
* **Data Fetching:** Use the custom `useConvexQuery` hook from `@/hooks/useConvexQuery` and `api` from `@/convex/_generated/api`[cite: 5].

---

## 2. Step 1: Backend Inspection & API Extension 

Inspect `convex/expenses.js`, `convex/users.js`, and `convex/dashboard.js` to locate or create the necessary one-to-one queries[cite: 5]. 

1. **Required Backend Data:**
   * **Friend Profile:** A query to fetch a user's details (`name`, `imageUrl`) by their `_id`.
   * **1:1 Balance:** A query calculating the exact net balance between the `currentUser` and this specific friend (`personId`).
   * **1:1 Transaction History:** A query that merges records from both the `expenses` and `settlements` tables[cite: 5] involving *only* the `currentUser` and `personId`.
2. **Query Safety Rules:**
   * Always authenticate the current user first (`const currentUser = await ctx.runQuery(api.users.getCurrentUser);`).
   * If `!currentUser`, gracefully return `null` or empty arrays to prevent frontend crashes during Clerk hydration.

---

## 3. Step 2: Frontend Structure (`app/(main)/person/[id]/page.jsx`)

Implement the person page using a clean, single-column layout optimized for reading a transaction history.

### A. Header & Profile Identity
* **Back Navigation:** A subtle left-aligned back button or breadcrumb returning to `/contacts` or `/dashboard`.
* **Friend Profile:** Large `Avatar` (using the friend's `imageUrl` and initials fallback) and an `h1` displaying the friend's name.

### B. One-to-One Balance Summary
* **Net Balance Card:** A prominent card displaying the exact financial standing between the user and this friend.
* **Color Coding:** Use green text (`+$XX.XX`) if the friend owes the user, red text (`-$XX.XX`) if the user owes the friend, and neutral gray (`$0.00`) if they are settled up.

### C. Action Buttons
* **Add Expense:** A primary gradient button routing to `/expenses/new?friend=[id]` (or opening a modal) to create a new expense pre-filled with this friend.
* **Settle Up:** A secondary outline button to record a payment specifically between the user and this friend.

### D. Transaction Feed (History)
Render a chronological list (newest first) of all shared activity:
* **Expense Row:** Show the formatted `date`, a category icon, the `description`, who paid, the total amount, and the current user's specific split. Indicate if the current user lent or borrowed money.
* **Settlement Row:** Show a distinct visual badge/icon indicating a payment (e.g., *"You paid Alex $25.00"*).
* **Row Actions:** Include a small "Delete" or "Edit" icon button for expenses created by the current user, wired to the existing expense deletion mutation[cite: 5].

### E. Loading & Empty States
* **Loading State:** While `useConvexQuery` is fetching, display a `LoaderCircle` (`animate-spin`) or skeleton rows.
* **Empty State:** If the transaction history is empty, show a clean empty state card (e.g., a receipt icon) stating "No shared expenses yet" and prompting them to add their first expense.