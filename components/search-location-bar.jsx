"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { City, State } from "country-state-city";
import { Calendar, Loader2, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import debounce from "lodash/debounce";
import { getCategoryIcon } from "@/lib/data";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createLocationSlug } from "@/lib/location-utils";

const SearchLocationBar = () => {
  const router = useRouter();
  const searchRef = useRef(null);

  // UI state
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Queries & mutations
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: updateLocation } = useConvexMutation(
    api.users.completeOnboarding
  );

  const { data: searchResults, isLoading: searchLoading } =
    useConvexQuery(
      api.search.searchEvents,
      searchQuery.trim().length >= 2
        ? { query: searchQuery, limit: 5 }
        : "skip"
    );

  // States & cities
  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const state = indianStates.find((s) => s.name === selectedState);
    if (!state) return [];
    return City.getCitiesOfState("IN", state.isoCode);
  }, [selectedState, indianStates]);

  // Init from user profile
  useEffect(() => {
    if (currentUser?.location) {
      setSelectedState(currentUser.location.state || "");
      setSelectedCity(currentUser.location.city || "");
    }
  }, [currentUser]);

  // Debounced search
  const debouncedQuery = useRef(
    debounce((value) => setSearchQuery(value), 300)
  ).current;

  useEffect(() => {
    return () => debouncedQuery.cancel();
  }, [debouncedQuery]);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedQuery(value);
    setShowSearchResults(value.length >= 2);
  };

  const handleEventClick = (slug) => {
    setShowSearchResults(false);
    setInputValue("");
    setSearchQuery("");
   router.push(`/explore/${slug}`);

  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Location select
  const handleLocationSelect = async (city, state) => {
    if (!city || !state) return;

    try {
      if (currentUser?.interests) {
        await updateLocation({
          location: { city, state, country: "India" },
          interests: currentUser.interests,
        });
      }

      const slug = createLocationSlug(city, state);
      router.push(`/explore/${slug}`);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  return (
    <div className="flex items-center gap-0">
      {/* SEARCH */}
      <div className="relative w-[280px]" ref={searchRef}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />

        <Input
          value={inputValue}
          placeholder="Search events..."
          onChange={handleSearchInput}
          onFocus={() => {
            if (inputValue.length >= 2) setShowSearchResults(true);
          }}
          className="
            h-9 w-full px-3 pl-8 text-xs
            rounded-none rounded-l-md
            bg-zinc-900 border border-zinc-700
            text-zinc-200 placeholder:text-zinc-500
          "
        />

        {showSearchResults && (
          <div className="absolute top-full mt-2 w-96 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-2 text-xs font-semibold text-zinc-400">
                  SEARCH RESULTS
                </p>

                {searchResults.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventClick(event.slug)}
                    className="group w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl mt-0.5">
                        {getCategoryIcon(event.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-100 truncate">
                          {event.title}
                        </p>

                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(event.startDate, "MMM dd")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.city}
                          </span>
                        </div>
                      </div>

                      {event.ticketType === "free" && (
                        <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-200">
                          Free
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* STATE */}
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
      >
        <SelectTrigger className="h-8 w-40 text-sm rounded-none border-l-0 bg-zinc-900 border-zinc-700 text-white">
          <SelectValue placeholder="State" />
        </SelectTrigger>

        <SelectContent className="bg-zinc-950 border border-zinc-800 text-white">
          {indianStates.map((state) => (
            <SelectItem
              key={state.isoCode}
              value={state.name}
              className="hover:bg-zinc-700"
            >
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* CITY */}
      <Select
        value={selectedCity}
        disabled={!selectedState}
        onValueChange={(value) => {
          setSelectedCity(value);
          handleLocationSelect(value, selectedState);
        }}
      >
        <SelectTrigger className="h-8 w-40 text-sm rounded-none rounded-r-md border-l-0 bg-zinc-900 border-zinc-700 text-white">
          <SelectValue placeholder="City" />
        </SelectTrigger>

        <SelectContent className="bg-zinc-950 border border-zinc-800 text-white">
          {cities.map((city) => (
            <SelectItem
              key={city.name}
              value={city.name}
              className="hover:bg-zinc-700"
            >
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchLocationBar;
