import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mt-16 flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        
        {/* 404 Number (No container) */}
        <p className="mb-4 text-7xl font-black text-[#b94bdb] sm:text-8xl">
          404
        </p>
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        
        {/* <p className="mt-4 text-lg text-muted-foreground sm:mt-6">
          Looks like this page got lost in the split. We couldn't find the resource you were looking for.
        </p> */}
        
        <div className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 bg-[#b94bdb]/80 px-8 text-base text-white shadow-lg shadow-[#b94bdb]/20 hover:bg-[#b94bdb]/90"
            render={<Link href="/" />}
          >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
          </Button>
        </div>
        
      </div>
    </main>
  );
}