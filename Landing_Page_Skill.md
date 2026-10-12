You are an expert Next.js frontend developer. Your task is to completely rewrite the `app/page.js` file for "Tally," an expense-sharing web application. Currently, the page is just a placeholder rendering "Sub" content and a destructive button. 

Please build a modern, high-converting landing page using Next.js App Router, Tailwind CSS v4, shadcn/ui components, and Lucide React icons. 

### Design & Architecture Constraints
* **Tech Stack:** Next.js, React 19.3.0, and Tailwind CSS v4.
* **UI Library:** Use the existing shadcn-style UI components present in `components/ui/` (e.g., Button, Card).
* **Authentication:** Tally uses Clerk for authentication. Ensure primary Call-to-Action (CTA) buttons route users to `/sign-up` or use Clerk's `<SignUpButton>`. 
* **Navigation Anchors:** The existing global header in `components/header.jsx` contains anchors for "Features" and "How it works". You must include matching `id="features"` and `id="how-it-works"` attributes on the respective sections so the header links function correctly.
* **Single Theme & Branding:** Do NOT implement a light and dark mode toggle. The project contains logo files in the repository. Extract or infer the primary and secondary brand colors from these logos to configure the Tailwind theme. Apply these brand colors to the primary buttons, hover states, icons, and section backgrounds to create a cohesive brand identity. Use CSS variables for easy theming in `app/globals.css` if necessary.


### Page Structure & Copy Requirements

Please implement the following sections sequentially:

**1. Hero Section (Above the Fold)**
* **Headline:** "Share Expenses Without the Math."
* **Subheadline:** "The easiest way to track balances, split bills with friends and family, and settle up in seconds."
* **Primary CTA:** A prominent, high-contrast shadcn Button saying "Get Started Free" that links to the sign-up flow.
* **Hero Visual (Empty Box):** Leave a dedicated, empty placeholder box (e.g., a large `aspect-video` div with a dashed border, subdued background, and an image icon) where the actual hero image will be dropped in later. 

**2. Value Proposition & Features (`id="features"`)**
* **Context:** Frame the features around Tally's actual capabilities.
* Use a grid layout of shadcn Cards to highlight the following features:
  * **Flexible Splits:** "Split equally, by exact amounts, or by percentages."
  * **Group Organization:** "Create groups for trips, roommates, or events with admin controls."
  * **Seamless Settlements:** "Keep track of who owes who and record payments instantly."

**3. How It Works (`id="how-it-works"`)**
* Provide a simple 3-step visual guide using Lucide icons colored with the brand's primary purple theme:
  1. Create a group or select a friend.
  2. Add an expense and choose how to split it.
  3. Check balances and settle up.

**4. Trust & Social Proof**
* Include a minimalist section featuring 2-3 mock testimonials praising how easy it is to avoid awkward money conversations. Use shadcn Cards for the testimonials.

**5. Closing Section & Footer**
* **Final CTA:** A centered section repeating the "Start Tracking Expenses" call to action, styled with the primary purple brand color.
* **Footer:** A simple footer containing placeholder links for Privacy Policy, Terms of Service, and a copyright notice for Tally.

Ensure the final code is fully responsive (mobile-first) and drop-in ready for `app/page.js`.