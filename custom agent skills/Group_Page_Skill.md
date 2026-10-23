---
name: create-tally-group-page
description: Implement the dynamic group detail page in app/(main)/groups/[id]/page.jsx and its child components for the Tally expense-sharing app.
---

# Tally Group Page Implementation Skill

You are an expert full-stack Next.js and Convex developer working on **Tally**, an expense-sharing web application. Your objective is to implement the `app/(main)/groups/[id]/page.jsx` file using a 2-column dashboard layout, extract/reuse transaction components, and build dedicated group overview components.

---

## 1. Tech Stack & Architecture Constraints

* **Framework:** Next.js `16.4.0` (App Router, `"use client"` for interactive views) and React `19.3.0`.
* **Dynamic Routing:** Route parameters must be unwrapped using React's `use()` hook (e.g., `const { id } = use(params);`).
* **Styling & UI:** Tailwind CSS v4, shadcn-style UI primitives (`Card`, `Button`, `Avatar`, `Badge`, `Tabs`), and `lucide-react` icons.
* **Button Component Rules:** The project uses a custom Base UI Button. If wrapping a custom component (like a Next.js `<Link>`), you **must** use the render prop: `<Button render={<Link href="..." />} />` (never use `asChild`).
* **Data Fetching:** Use the custom `useConvexQuery` hook from `@/hooks/useConvexQuery` and `api` from `@/convex/_generated/api`.

---

## 2. Step 1: Backend Inspection & API Extension

Inspect `convex/groups.js` to locate or refine the group aggregation query. The query must return:
1. **Group Details:** `name`, `description`.
2. **Current User Position:** The exact net balance of the current user within this group.
3. **Total Group Spending:** The absolute sum of all expenses recorded in this group.
4. **Member List:** An array of member objects containing their `id`, `name`, `imageUrl`, `role`, and their **individual calculated net balance** within the group.
5. **Transactions:** Arrays of `expenses` and `settlements` associated with the group ID.

---

## 3. Step 2: Component Creation & Organization

You must organize the UI into modular files inside the `components/` directory.

### A. Reuse Existing Transaction Components
* Ensure `ExpenseCard` and `SettlementCard` are extracted into reusable components (e.g., `components/ExpenseCard.jsx` and `components/SettlementCard.jsx`). 
* Import and use these existing components for the transaction feeds rather than redefining them in the group page.

### B. Create `components/GroupBalance.jsx`
Create a new file for the balance summary card.
* **Props:** `userNetBalance` (number), `totalSpending` (number).
* **UI Structure:** 
  * A main, prominent display of the user's net balance (color-coded: green for positive/owed to you, red for negative/you owe).
  * A status label explaining the balance (e.g., "You owe the group", "The group owes you", or "Settled up").
  * A secondary metric displaying the **Total Group Spending**.

### C. Create `components/GroupMembers.jsx`
Create a new file for the members list card.
* **Props:** `groupId` (string), `members` (array).
* **Header:** A title ("Members"), a count badge, and a small "Add Member" icon button linking to an invitation flow or modal.
* **Member List (Detailed View):** Render a scrollable vertical list of members. For each member, display:
  * Their `Avatar` (using `imageUrl` and initials).
  * Their `name` and role (e.g., "Admin").
  * Their specific net balance in the group (color-coded green/red/gray), so everyone's financial standing is visible at a glance.

---

## 4. Step 3: Frontend Page Structure (`app/(main)/groups/[id]/page.jsx`)

Assemble the page using the components created above.

### A. Top Navigation & Header
* **Back Button:** A subtle left-aligned button executing `router.back()` to return to the previous screen.
* **Header Area:** 
  * *Left:* Display the Group Name (`h1`) and Description.
  * *Right:* Primary Action buttons: **Add Expense** (routing to `/expenses/new?group=[id]`) and **Settle Up** (routing to `/settlements/new?group=[id]`).

### B. Overview Row (2-Column Grid)
Render a responsive grid (`grid-cols-1 md:grid-cols-2` with a `gap-6`) immediately below the header.
* **Left Column:** Render the `<GroupBalance />` component.
* **Right Column:** Render the `<GroupMembers />` component.

### C. Transaction Feed Area (Tabs)
Below the Overview Row, implement a `Tabs` component to filter the financial history.
* **Tabs Navigation:** `<TabsList>` with two triggers: "Expenses" (using `Receipt` icon) and "Settlements" (using `HandCoins` icon).
* **Expenses Tab (`<TabsContent value="expenses">`):** Map over the group's expenses and render the reusable `<ExpenseCard />` for each. Handle empty states gracefully.
* **Settlements Tab (`<TabsContent value="settlements">`):** Map over the group's settlements and render the reusable `<SettlementCard />` for each. Handle empty states gracefully.