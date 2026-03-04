import { v } from "convex/values";
import { query } from "./_generated/server";

/* ================= FEATURED EVENTS ================= */

export const getFeaturedEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter(q => q.gte(q.field("startDate"), now))
      .collect();

    return events
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, args.limit ?? 3);
  },
});

/* ================= EVENTS BY LOCATION ================= */

export const getEventsByLocation = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter(q => q.gte(q.field("startDate"), now))
      .collect();

    if (args.city) {
      events = events.filter(
        e => e.city.toLowerCase() === args.city.toLowerCase()
      );
    } else if (args.state) {
      events = events.filter(
        e => e.state.toLowerCase() === args.state.toLowerCase()
      );
    }

    return events.slice(0, args.limit ?? 4);
  },
});

/* ================= POPULAR EVENTS ================= */

export const getPopularEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter(q => q.gte(q.field("startDate"), now))
      .collect();

    return events
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, args.limit ?? 6);
  },
});

/* ================= EVENTS BY CATEGORY ================= */

export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_category", q => q.eq("category", args.category))
      .filter(q => q.gte(q.field("startDate"), now))
      .collect();

    return events.slice(0, args.limit ?? 50);
  },
});

/* ================= CATEGORY COUNTS ================= */

export const getCategoryCounts = query({
  handler: async (ctx) => {
    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter(q => q.gte(q.field("startDate"), now))
      .collect();

    const counts = {};

    for (const event of events) {
      counts[event.category] = (counts[event.category] || 0) + 1;
    }

    return counts;
  },
});
