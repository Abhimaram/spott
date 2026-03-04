"use client";

import React from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { parseLocationSlug } from "@/lib/location-utils";
import { CATEGORIES } from "@/lib/data";
import EventCard from "@/components/event-card";

const DynamicExplorePage = () => {
  const params = useParams();
  const router = useRouter();

  // ✅ normalize slug (Next.js can return string | string[])
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  // ✅ category check
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = Boolean(categoryInfo);

  // ✅ location parsing (only if not category)
  const locationData = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

  const { city, state, isValid } = locationData;

  // ❌ invalid slug → 404
  if (!isCategory && !isValid) {
    notFound();
  }

  // ✅ fetch events
  const { data: events, isLoading } = useConvexQuery(
    isCategory
      ? api.explore.getEventsByCategory
      : api.explore.getEventsByLocation,
    isCategory
      ? { category: slug, limit: 50 }
      : city && state
      ? { city, state, limit: 50 }
      : "skip"
  );

  const handleEventClick = (eventSlug) => {
    router.push(`/events/${eventSlug}`);
  };

  // ⏳ loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // ================= CATEGORY PAGE =================
  if (isCategory) {
    return (
      <>
        <div className="pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold">
                {categoryInfo.label}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {categoryInfo.description}
              </p>
            </div>
          </div>

          {events?.length > 0 && (
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {events?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No events found in this category.
          </p>
        )}
      </>
    );
  }

  // ================= LOCATION PAGE =================
  return (
    <>
      <div className="pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">📍</div>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Events in {city}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {state}, India
            </p>
          </div>
        </div>

        {events?.length > 0 && (
          <p className="text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {events?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No events found in this location.
        </p>
      )}
    </>
  );
};

export default DynamicExplorePage;
  