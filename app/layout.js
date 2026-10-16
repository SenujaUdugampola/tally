import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: "Tally",
  description: "A platform for sharing expenses with friends and family",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={inter.className}>
      <head>
        <link rel="icon" href="/logos/logo-s.png" type="image/png" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ConvexClientProvider>
            
            <Suspense fallback={<div className="h-16 w-full border-b bg-white/95" />}>
              <Header />
            </Suspense>
              
            <main className="min-h-screen">
             {children} 
             <Toaster richColors/>
            </main>

            <Footer />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}