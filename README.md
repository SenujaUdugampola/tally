# Tally — Smart Expense Sharing Platform

Tally is a full-stack collaborative expense-sharing web application built with Next.js, Convex, and Clerk[cite: 1, 8]. Designed for friends, roommates, and family, Tally streamlines splitting shared costs, tracking one-to-one and group balances, and managing settlements in real time[cite: 1, 8].

---

## Features

- **Authentication & Synchronization:** Secure sign-in and sign-up flows powered by Clerk, automatically synced to Convex user profiles.
- **Contacts & Group Management:** Discover contacts, create custom groups with role-based memberships (Admin/Member), and manage shared affiliations.
- **Real-Time Data Backend:** High-performance, reactive document storage and indexed queries using Convex.
- **Dynamic Split Calculations:** Support for splitting expenses equally, by exact amounts, or via percentages (in development).
- **Dashboard & Spending Analytics:** Real-time visibility into balances, monthly/annual expenditure summaries, and debt settlement tracking (in development).
- **Modern UI/UX:** Responsive interface built with Tailwind CSS v4 and shadcn-style component primitives.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler)
- **Frontend Library:** [React 19](https://react.dev/)[cite: 1]
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, `next-themes`
- **Backend & Database:** [Convex](https://www.convex.dev/)[cite: 1]
- **Authentication:** [Clerk](https://clerk.com/)[cite: 1]
- **Background Jobs:** [Inngest](https://www.inngest.com/)[cite: 1]

---

## Project Structure

```text
tally/
├── app/
│   ├── (auth)/             # Clerk sign-in & sign-up routes
│   ├── (main)/
│   │   ├── contacts/       # Contacts list & group creation modal[cite: 1]
│   │   └── dashboard/      # Spending summaries & balance dashboard[cite: 1]
│   ├── api/inngest/        # Inngest webhook route handlers[cite: 1]
│   ├── layout.js           # Root layout with Clerk & Convex providers[cite: 1]
│   └── page.js             # Landing page[cite: 1]
├── components/
│   ├── ui/                 # Reusable UI primitives (dialogs, buttons, inputs)[cite: 1]
│   ├── ConvexClientProvider.jsx # Convex client integration with Clerk auth[cite: 1]
│   └── header.jsx          # Global navigation and authentication controls[cite: 1]
├── convex/
│   ├── auth.config.js      # Clerk JWT issuer configuration[cite: 1]
│   ├── contacts.js         # Contacts and group management queries/mutations[cite: 1]
│   ├── dashboard.js        # Spending aggregation and balance calculations[cite: 1]
│   ├── schema.js           # Convex tables (users, groups, expenses, settlements)[cite: 1]
│   └── users.js            # User synchronization mutations[cite: 1]
├── hooks/                  # Custom hooks (e.g., useStoreUser, useConvexQuery)[cite: 1]
└── lib/inngest/            # Background event handlers and scheduled functions[cite: 1]
