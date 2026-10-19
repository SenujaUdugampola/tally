"use client"

import { useStoreUser } from '@/hooks/useStoreUser';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { BarLoader } from "react-spinners";
import { Button } from './ui/button';
import { LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { isLoading } = useStoreUser();
  const path = usePathname();

  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-3 h-16 flex items-center justify-between"> 
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src={"/logos/logo.png"} 
            alt="tally. Logo" 
            width={400} 
            height={60} 
            className="h-11 w-auto object-contain pl-0"
            priority
          />
        </Link>

        {path==='/' && (
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="#features" 
              className="text-sm font-medium hover:text-purple-500 transition"
            >
              Features
            </Link>
            <Link 
              href="#howitworks" 
              className="text-sm font-medium hover:text-purple-500 transition"
            >
              How it works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Authenticated>
            <Link href="/dashboard">
              <Button 
                variant="outline"
                className = "hidden md:inline-flex items-center gap-2 hover:text-purple-500 hover:border-purple-500 hover:bg-purple-100 transition"
              >
                <LayoutDashboard className = "h-4 w-4" />
                Dashboard
              </Button>

              <Button variant="ghost" className="md:hidden w-10 h-10 px-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton>
              <Button variant={"ghost"}>Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-purple-400 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>

      {isLoading && <BarLoader width="100%" color="#CB6CE7" />}

    </header>
  )
}

export default Header