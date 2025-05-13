import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";

//! this is dynamic -> for both admin and user
const Header = async ({ isAdminPage = false }) => {
  const isAdmin = false;
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={isAdmin ? "/admin" : "/"} className="flex">
          <Image
            src={"/logo-black.png"}
            width={200}
            height={60}
            alt="logo"
            className="h-12 w-auto object-contain"
          />
          {isAdminPage && (
            <span className="text-xs font-extralight">admin</span>
          )}
        </Link>
        <div className="flex items-center gap-4">
          {isAdminPage ? (
            <Link href="/">
              <Button
                className="cursor-pointer flex items-center gap-2"
                variant="outline"
              >
                <ArrowLeft size={18} />
                <span>Go to Homepage</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button className="cursor-pointer">
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>
              {isAdmin ? (
                <Link href="/admin">
                  <Button className="cursor-pointer">
                    <Layout size={18} />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/reservations">
                  <Button variant="outline" className="cursor-pointer">
                    <CarFront size={18} />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          {/* show the login button if user is signed out */}
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline" className="cursor-pointer">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          {/* // show the user avatar from clerk if the use is signed in */}
          <SignedIn>
            <UserButton
              className="cursor-pointer"
              appearance={{
                elements: {
                  avatarBox: "w-20 h-20",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
