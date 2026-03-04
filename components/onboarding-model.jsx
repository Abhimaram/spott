"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, MapPin } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { City, State } from "country-state-city";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CATEGORIES } from "@/lib/data";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";

export function OnboardingModal({ isOpen, onClose, onComplete }) {
  const totalSteps = 2;

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });

  const progress = (step / totalSteps) * 100;

  const { mutate: completeOnboarding, isLoading } =
    useConvexMutation(api.users.completeOnboarding);

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!location.state) return [];

    const selectedState = indianStates.find(
      (s) => s.name === location.state
    );

    if (!selectedState) return [];

    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const toggleInterests = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

 const handleComplete = async () => {
  try {
    await completeOnboarding({
      interests: selectedInterests, // ✅ FIXED
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
      },
    });

    toast.success("Welcome to Spott! 🎉");
    onComplete();
  } catch (error) {
    toast.error("Failed to complete onboarding");
    console.error(error);
  }
};

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }

    if (step === 2 && (!location.state || !location.city)) {
      toast.error("Please select both state and city");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-4">
          <Progress.Root className="relative h-1 w-full overflow-hidden rounded bg-zinc-800">
            <Progress.Indicator
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </Progress.Root>

          <DialogTitle className="flex items-center gap-2 text-2xl mt-4">
            {step === 1 ? (
              <>
                <Heart className="w-6 h-6 text-purple-500" />
                What interests you?
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-purple-500" />
                Where are you located?
              </>
            )}
          </DialogTitle>

          <DialogDescription>
            {step === 1
              ? "Select at least 3 categories to personalize your experience"
              : "We'll show you events happening near you"}
          </DialogDescription>
        </DialogHeader>

        {/* CONTENT */}
        <div className="px-6 py-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleInterests(category.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedInterests.includes(category.id)
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-zinc-800 hover:border-purple-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium">
                      {category.label}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedInterests.length} selected
                </Badge>

                {selectedInterests.length >= 3 && (
                  <span className="text-sm text-green-500">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              {/* SELECTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* STATE */}
                <div className="space-y-2">
                  <Label className="text-zinc-400">State</Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) =>
                      setLocation({ ...location, state: value, city: "" })
                    }
                  >
                    <SelectTrigger className="h-11 w-full bg-zinc-950 border border-zinc-800 text-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem
                          key={state.isoCode}
                          value={state.name}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CITY */}
                <div className="space-y-2">
                  <Label className="text-zinc-400">City</Label>
                  <Select
                    value={location.city}
                    disabled={!location.state}
                    onValueChange={(value) =>
                      setLocation({ ...location, city: value })
                    }
                  >
                    <SelectTrigger className="h-11 w-full bg-zinc-950 border border-zinc-800 text-white">
                      <SelectValue
                        placeholder={
                          location.state
                            ? "Select city"
                            : "State first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem
                          key={city.name}
                          value={city.name}
                        >
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LOCATION SUMMARY */}
              {location.city && location.state && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Your location</p>
                      <p className="text-sm text-zinc-400">
                        {location.city}, {location.state},{" "}
                        {location.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
       <DialogFooter className="px-6 pb-6">
  <div className="flex items-center gap-4 w-full">
    {/* BACK BUTTON */}
   <Button
  variant="outline"
  onClick={() => setStep(step - 1)}
  className="
    gap-2
    rounded-full
    border-zinc-700
    text-black
    hover:text-black
  "
>
  <ArrowLeft className="w-4 h-4" />
  Back
</Button>


    {/* PRIMARY BUTTON */}
    <Button
      onClick={handleNext}
      disabled={isLoading}
      className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
          Completing...
        </span>
      ) : (
        <>
          {step === 2 ? "Complete Setup" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </Button>
      </div>
      </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
