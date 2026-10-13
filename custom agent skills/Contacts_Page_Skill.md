You are an expert Next.js frontend developer. Your task is to complete the `app/(main)/contacts/page.jsx` file for "Tally," an expense-sharing application. 

Currently, this file is a client route wired to a Convex contacts query, but it only renders an empty heading after loading and lacks the presentation for contacts and groups[cite: 14].

### Design & Architecture Constraints
* **Tech Stack:** Next.js 16.4.0 (App Router), React 19.3.0, and Tailwind CSS v4[cite: 14].
* **UI Library:** shadcn-style UI components and Lucide React icons[cite: 14].
* **Branding:** Use the Tally brand purple (`#b94bdb`) for primary buttons, active tab states, and focus rings. 
* **Data Fetching:** Assume a Convex query hook (e.g., `const { data, isLoading } = useQuery(api.contacts.getAllContacts)`) is being used. The query returns an object with two arrays: `{ users: [], groups: [] }`.

### Page Structure & UI Requirements

Please implement the page with the following structure sequentially:

**1. Page Header & Actions**
* **Title:** A clean "Contacts" page heading.
* **Global Actions:** Two prominent buttons aligned to the right (or stacked on mobile): "Add Friend" and "Create Group." Use the primary brand color (`#b94bdb`) for these. For now, they can just be standard buttons (they will open modals later).

**2. List Navigation (Tabs)**
* Implement shadcn `Tabs` to allow the user to toggle between two views: "Friends" and "Groups".
* Default the active tab to "Friends".

**3. "Friends" Tab Content (Individual Contacts)**
* **Constraint:** Display a grid or list of shadcn `Card` components for the `users` array. Each card MUST ONLY contain the user's avatar and basic info. **Do not include any balances, money amounts, or "Settle Up" buttons.**
* **Details to display:** 
  * Avatar: Use the user's `imageUrl` if available, otherwise display a fallback avatar with their initials.
  * Info: Display the user's `name` and `email`.

**4. "Groups" Tab Content**
* **Constraint:** Display a grid or list of shadcn `Card` components for the `groups` array. Each card MUST ONLY contain the group's avatar/icon and basic info. **Do not include group balances or money amounts.**
* **Details to display:**
  * Avatar: A generic group icon (e.g., Lucide `Users`) in a styled rounded container.
  * Info: Display the group `name`, `description` (if available), and `memberCount` (e.g., "4 members").

**5. State Management**
* **Loading State:** While `isLoading` is true, display a clean skeleton loader or a centered spinner.
* **Empty States:** If a tab has no data (e.g., `users.length === 0`), render a friendly empty state using a Lucide icon (like `UserPlus` for friends or `Users` for groups), a brief message ("You haven't added any friends yet"), and a secondary button prompting them to add one.

Ensure the final code is fully responsive (mobile-first), handles potential `null` or `undefined` data gracefully, and is ready to be dropped into `app/(main)/contacts/page.jsx`.