import { auth } from '@clerk/nextjs/server';

// Opt out of instant prerendering to allow the runtime Clerk auth check
export const instant = false;

export default async function MainLayout({ children }) {
  // Fetch the authentication state and the redirect helper
  const { userId, redirectToSignIn } = await auth();
  
  // Enforce authentication manually
  if (!userId) {
    return redirectToSignIn();
  }

  // Render the content with your existing styling
  return (
    <div className="container mx-auto mt-24">
      {children}
    </div>
  );
}