import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

const SignInPage = () => {
  return (
    // Add a simple loading skeleton or text as the fallback
    <Suspense fallback={<div className="flex justify-center mt-10">Loading...</div>}>
      <SignIn />
    </Suspense>
  );
};

export default SignInPage;