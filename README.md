# Tally — Smart Expense Sharing Platform

Tally is a full-stack collaborative expense-sharing web application built with Next.js, Convex, and Clerk. Designed for friends, roommates, and family, Tally streamlines splitting shared costs, tracking one-to-one and group balances, and managing settlements in real time.

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
- **Frontend Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, `next-themes` , shadcn/ui
- **Backend & Database:** [Convex](https://www.convex.dev/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Background Jobs:** [Inngest](https://www.inngest.com/)
---

## Project Structure

```text
tally/
├── app/
│   ├── (auth)/             # Clerk sign-in & sign-up routes
│   ├── (main)/
│   │   ├── contacts/       # Contacts list & group creation modal
│   │   └── dashboard/      # Spending summaries & balance dashboard
│   ├── api/inngest/        # Inngest webhook route handlers
│   ├── layout.js           # Root layout with Clerk & Convex providers
│   └── page.js             # Landing page
├── components/
│   ├── ui/                 # Reusable UI primitives (dialogs, buttons, inputs)
│   ├── ConvexClientProvider.jsx # Convex client integration with Clerk auth
│   └── header.jsx          # Global navigation and authentication controls
├── convex/
│   ├── auth.config.js      # Clerk JWT issuer configuration
│   ├── contacts.js         # Contacts and group management queries/mutations
│   ├── dashboard.js        # Spending aggregation and balance calculations
│   ├── schema.js           # Convex tables (users, groups, expenses, settlements)
│   └── users.js            # User synchronization mutations
├── hooks/                  # Custom hooks (e.g., useStoreUser, useConvexQuery)
└── lib/inngest/            # Background event handlers and scheduled functions
