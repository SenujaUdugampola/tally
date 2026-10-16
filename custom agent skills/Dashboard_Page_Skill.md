---
name: create-tally-dashboard
description: Inspect and extend convex/dashboard.js and implement the complete User Dashboard UI in app/(main)/dashboard/page.jsx for the Tally expense-sharing app.
---

# Tally Dashboard Implementation Skill

You are an expert full-stack Next.js and Convex developer working on **Tally**, an expense-sharing web application[cite: 14]. Your objective is to replace the placeholder `app/(main)/dashboard/page.jsx` route with a complete, query-backed financial dashboard, and add any missing backend queries (such as the Recent Activity Feed) inside `convex/dashboard.js`[cite: 14].

---

## 1. Tech Stack & Architecture Constraints

* **Framework:** Next.js `16.4.0` (App Router, `"use client"` for interactive query views) and React `19.3.0`[cite: 12, 14].
* **Styling & UI:** Tailwind CSS v4, shadcn-style UI primitives (`Card`, `Button`, `Avatar`, `Badge`, `Tabs`), and `lucide-react` icons[cite: 12, 14].
* **Brand Palette:** Primary purple `#b94bdb` with complementary gradients (`from-[#b94bdb] to-[#8068e8]`), soft borders (`border-[#ead8ef]`, `dark:border-white/10`), and translucent card surfaces (`bg-white/75`, `dark:bg-white/5`) matching `app/(main)/contacts/page.jsx`[cite: 12].
* **Data Fetching:** Use the custom `useConvexQuery` hook from `@/hooks/useConvexQuery` and `api` from `@/convex/_generated/api`[cite: 11, 12, 14].

---

## 2. Step 1: Backend Inspection & API Extension (`convex/dashboard.js`)

Before building the frontend, inspect `convex/dashboard.js` and `convex/schema.js`[cite: 7, 14].

1. **Review Existing Queries:**
   * `convex/dashboard.js` already contains initial queries for one-to-one balances, annual spending, monthly spending, and groups with calculated balances[cite: 14].
   * Preserve the exact function names, coding style, helper patterns, and authentication checks (`const currentUser = await ctx.runQuery(api.users.getCurrentUser);`) used in `convex/dashboard.js` and `convex/contacts.js`[cite: 13, 14].
   * Ensure all queries gracefully handle unauthenticated/loading states (if `!currentUser`, return safe empty defaults instead of crashing).

2. **Implement Missing Queries (Recent Activity Feed):**
   * If `convex/dashboard.js` does not yet have a query for recent activity (e.g., `getRecentActivity`), create and export it inside `convex/dashboard.js` following the exact patterns of the existing queries in that file[cite: 14].
   * **Data Merging (`expenses` + `settlements`):**
     * Query the `expenses` table (`description`, `amount`, `category`, `date`, `paidByUserId`, `splitType`, `splits`, `groupId`)[cite: 7] where the current user either paid (`paidByUserId === currentUser._id`) or is included in `splits`[cite: 7, 13].
     * Query the `settlements` table (`amount`, `note`, `date`, `paidByUserId`, `receivedByUserId`, `groupId`)[cite: 7] where `paidByUserId === currentUser._id` or `receivedByUserId === currentUser._id`[cite: 7].
     * Resolve related user profiles (`name`, `imageUrl`) from the `users` table (and optional group names from `groups`) so the frontend can display human-readable names[cite: 7, 13].
     * Normalize both record types with a `type: "expense" | "settlement"` discriminator, sort them chronologically by `date` descending (newest first), and return the most recent items (e.g., top 10–15).

---

## 3. Step 2: Frontend Dashboard Structure (`app/(main)/dashboard/page.jsx`)

Implement the dashboard page (and modularize sub-components under `app/(main)/dashboard/_components/` if helpful) with the following sections:

### A. Dashboard Header & Quick Actions
* **Header:** Display a "Dashboard" title, a subtle top pill badge (matching the `"Your circle"` badge style on `/contacts`), and a brief subtitle[cite: 12].
* **Primary CTAs:**
  * **Add Expense:** Primary gradient button (`bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white`)[cite: 12] linking to `/expenses/new` (or opening an expense creation flow)[cite: 14].
  * **Settle Up:** Secondary outline button (`ring-1 ring-[#b94bdb]/25 text-[#a23bc3]`)[cite: 12] to record a settlement[cite: 14].

### B. Top-Level Balance KPI Row (3-Column Grid)
Driven by the one-to-one/overall balances query in `convex/dashboard.js`[cite: 14]:
1. **Total Net Balance:** `youAreOwed - youOwe`. Display in green (`+$XX.XX`) if positive, red (`-$XX.XX`) if negative, or neutral gray (`$0.00`) if settled up.
2. **You Are Owed:** Total amount others owe the user in green, with subtext showing how many people owe them.
3. **You Owe:** Total amount the user owes others in red/amber, with subtext showing how many people they owe.

### C. Main Content Grid (Responsive 2-Column Layout on Desktop)

#### Left Column (2/3 Width):
1. **Spending Summary & Monthly Chart (`ExpenseSummary`):**
   * Powered by the annual and monthly spending queries in `convex/dashboard.js`[cite: 14].
   * Show two summary callouts at the top of the card: **This Month** spending and **This Year** spending[cite: 14].
   * Render a responsive monthly bar chart (using `recharts` or clean Tailwind bars if `recharts` is not installed) showing month-over-month personal spending[cite: 14].
2. **Recent Activity Feed (`RecentActivity`):**
   * Powered by the new/existing recent activity query in `convex/dashboard.js` merging `expenses` and `settlements` chronologically[cite: 7, 14]:
   * **Expense Item:**
     * Display a category icon/badge (`category`), `description`, formatted `date`, who paid (`paidByUserId` name), and a badge for `splitType` (`equal`, `percentage`, or `exact`)[cite: 7].
     * Clearly indicate whether the current user **lent** money (green `+` amount) or **borrowed** money (red `-` amount) on that transaction.
   * **Settlement Item:**
     * Display a distinct settlement icon/badge indicating a payment was recorded (e.g., *"You paid Alex $25.00"* or *"Sarah paid you $10.00"*) alongside the formatted `date` and any attached `note`[cite: 7].

#### Right Column (1/3 Width):
1. **One-to-One Balance Breakdown (`BalanceSummary`):**
   * Powered by the balances query in `convex/dashboard.js`[cite: 14].
   * Split into **"Owed to you"** and **"You owe"** sections.
   * Render each user's `Avatar` (`AvatarImage` with `imageUrl` and `AvatarFallback` initials), `name`, and color-coded balance[cite: 7, 12].
   * Filter out `$0.00` balances and link each row to `/person/[id]`.
2. **Your Groups Overview (`GroupList`):**
   * Powered by the groups with calculated balances query in `convex/dashboard.js`[cite: 14].
   * Display each group's icon, `name`, member count, and the user's net balance inside that group (green `+`, red `-`, or `"Settled up"`)[cite: 12, 14].
   * Link each group card/row to `/groups/[id]` and include a button to open `CreateGroupModal` (or navigate to `/contacts`)[cite: 11, 12].

### D. Loading & Empty States
* **Loading State:** While any primary `useConvexQuery` call is loading, display a centered `LoaderCircle` spinner (`animate-spin text-[#CB6CE7]`) or skeleton cards matching `app/(main)/contacts/page.jsx`[cite: 12].
* **Empty States:** Provide clean, encouraging empty states with Lucide icons when the user has no active balances, no groups, or no recent activity yet[cite: 12].