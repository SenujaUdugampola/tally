# Skill: Add Expense Page Architecture & Implementation

**Description:** This skill defines the architectural blueprint, component structure, and UX flow for implementing the `/expenses/new` page in the Tally application.

## UI Structure & User Flow

The Add Expense page should be built as a progressive, single-page form using Next.js client components and shadcn UI.

### 1. Expense Type Toggle (Entry Point)
*   **Component:** Use a prominent segmented control or a shadcn `<Tabs>` component at the top of the form.
*   **Options:** 
    *   `Group Expense`
    *   `Individual Expense` (1-on-1)
*   **State:** This toggle dictates which context selection UI is rendered next.

### 2. Participant & Context Selection (Dynamic)
*   **If Group is selected:** 
    *   Display a searchable dropdown listing the groups the current user is a member of.
    *   Upon selection, automatically load and lock in all group members as the expense participants.
*   **If Individual is selected:** 
    *   **CRITICAL DIRECTIVE:** You must reuse the exact same member selector UI and logic currently implemented in the `creategroupModal` file.
    *   The user should be able to search and select a single friend/contact from their network using this existing component pattern.

### 3. Core Expense Details (`expense-form`)
Render standard input fields mapping to the `expenses` table schema:
*   **Description:** Text input (e.g., "Dinner at Joe's").
*   **Amount:** Numeric input formatted as currency.
*   **Category:** Select dropdown utilizing the placeholder `category` component.
*   **Date:** Date picker component (defaulting to the current date).

### 4. Payer & Split Configuration (`split` component)
Define who paid and how the debt is divided among the selected participants.
*   **"Paid By" Selector:** A dropdown listing all involved participants (defaults to the current user).
*   **Split Type Selector:** A toggle or select for `Equal`, `Exact`, or `Percentage`.
*   **Dynamic Split Adjuster UI:** 
    *   Render a list of all participants.
    *   `Equal`: Display read-only calculated amounts (Amount / N).
    *   `Exact` / `Percentage`: Render input fields next to each user's name allowing manual adjustment.
    *   *Validation Requirement:* Ensure the split-total tolerance is strictly validated before allowing submission (e.g., splits must exactly equal the total amount or 100%).

### 5. Form Actions & Submission
*   **Cancel:** Routes the user back to the previous page (e.g., `router.back()`).
*   **Save Expense:** 
    *   Triggers the `convex.expenses.createExpense` mutation.
    *   Payload must include: `description`, `amount`, `category`, `date`, `paidByUserId`, `splitType`, `splits` (array of participant objects), and `groupId` (if applicable).
    *   **UX:** Implement a loading state on the button and use `sonner` toasts for success feedback or validation error handling.