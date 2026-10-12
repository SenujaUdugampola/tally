import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-10">Loading...</div>}>
      <SignUp />
    </Suspense>
  );
}

export default SignUpPage;