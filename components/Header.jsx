"use client";

import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { Badge, Building, Crown, Plus, Ticket } from "lucide-react";
import { OnboardingModal } from "./onboarding-model";
import { useOnboarding } from "@/hooks/use-onboarding";
import SearchLocationBar from "./search-location-bar";
import UpgradeModel from "./upgrade-model";

const Header = () => {
  const { isLoading } = useStoreUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    showOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
  } = useOnboarding();

    const {has} = useAuth();
    const hasPro = has?.({ plan: "pro"});

  return (
    <>
     <nav className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/spott.png"
              alt="Spott logo"
              width={500}
              height={500}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Pro badge */}
           {hasPro && (
            <span
           className="
           ml-3
           inline-flex items-center gap-1.5
            px-3 py-1
            rounded-full
            bg-gradient-to-r from-pink-500 to-orange-500
            text-white
           text-xs font-semibold
           leading-none
            "
          >
           <Crown className="w-3.5 h-3.5" />
          <span>Pro</span>
          </span>
          )}

          {/* Search & Location — Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <SearchLocationBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
           {!hasPro && (<Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
            >
              Pricing
            </Button>
           )} 

            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">Explore</Link>
            </Button>

            <Authenticated>
              <Button
                size="sm"
                asChild
                className="flex gap-2 bg-white text-black hover:bg-gray-200 rounded-full px-6"
              >
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>

              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="rounded-full bg-white text-black px-6"
                >
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>

        {/* Mobile Search & Location */}
        <div className="md:hidden border-t px-3 py-3">
          <SearchLocationBar />
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width="100%" color="#a855f7" />
          </div>
        )}
      </nav>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModel 
      isOpen={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      trigger='header'
      />
    </>
  );
};

export default Header;
