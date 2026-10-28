# Skill: Settlement Page Architecture & Implementation

**Description:** This skill defines the architectural blueprint, component structure, and UX flow for implementing the `/settlements/[type]/[id]` page in the Tally application.

## UI Structure & User Flow

The Settlement page is a unified route that dynamically adapts its UI depending on the `type` parameter ("person" vs "group"). It should be built using Next.js client components and shadcn UI.

### 1. The Route Wrapper (`page.jsx`)
*   **Params Handling:** The component must read the `type` and `id` parameters from the URL.
*   **Data Fetching:** 
    *   If `type === "person"`, fetch the 1-on-1 balances between the current user and the target user (`id`).
    *   If `type === "group"`, fetch the group's pair-wise ledger to determine outstanding debts within the group (`id`).
*   **Pass Context:** Pass the fetched data down to the underlying `SettlementForm` component.

### 2. Context Header
Dynamically display who the user is settling up with to provide clear context:
*   **Person Variation:** Render the friend's Avatar, Name, and a subtitle summarizing the total net amount. (e.g., "Settle up with Sanu").
*   **Group Variation:** Render the Group's Icon, Name, and a relevant subtitle. (e.g., "Settle up balances in Weekend Trip").

### 3. Debt Selection (Dynamic UI)
This is the core interaction area for determining *who* is being paid.
*   **Person Variation:** Since it's 1-on-1, simply display a read-only summary of the specific balance (e.g., "You owe Sanu $400").
*   **Group Variation (CRITICAL DIRECTIVE):** Use a **Radio Group (Radio Buttons)** to let the user select the specific payee. 
    *   Render a list of radio buttons for each group member the current user currently owes money to.
    *   Each radio option should display the member's name and the specific amount owed to them.
    *   Selecting a radio button must dynamically update the default value of the "Amount" input field below.

### 4. Core Form Inputs
Render standard input fields mapping to the `settlements` table schema:
*   **Amount:** Numeric input formatted as currency. Must default to the full amount of the selected debt but remain editable for partial payments.
*   **Date:** Date picker component (defaulting to the current date).
*   **Note:** Optional text input or textarea (e.g., "Venmo'd you for dinner").

### 5. Form Actions & Submission
*   **Cancel Button:** Routes the user back to the previous context (either the person's profile or the group page).
*   **Record Payment Button:** 
    *   Triggers the `convex.settlements.createSettlement` mutation.
    *   **Payload Requirements:** `amount`, `note`, `date`, `paidByUserId`, and `receivedByUserId`.
    *   If `type === "group"`, the payload **must** also include the `groupId`.
    *   **UX & Error Handling:** Wrap the submission in a `try/catch`. Since backend API issues are known in this route, implement robust user-facing error handling and success feedback using `sonner` toasts. Ensure the button has a loading state during submission.