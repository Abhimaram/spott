"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useConvexQuery } from "./use-convex-query";
import { api } from "@/convex/_generated/api";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser
  );

  useEffect(() => {
    if (isLoading || !currentUser) return;

    if (!currentUser.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [currentUser, isLoading, pathname]); // ✅ pathname is the key

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    router.push("/");
  };

  return {
    showOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    setShowOnboarding,
    needsOnboarding:
    !isLoading && currentUser && !currentUser.hasCompletedOnboarding,
  };
}
