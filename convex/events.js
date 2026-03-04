import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),

    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(), // ✅ FIXED (was timeZone)

    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(internal.users.getCurrentUser);

      // ✅ SAFETY CHECK
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate slug from title
      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const eventId = await ctx.db.insert("events", {
        ...args,
        slug: `${slug}-${Date.now()}`,
        organizerId: user._id,
        organizerName: user.name,
        registrationCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user's free event count
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1,
      });

      return eventId;
   } catch (error) {
  throw new Error(`Failed to create event: ${error.message}`);
}

  },
});


// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },

  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return event;
  },
});


// Get events by organizer
export const getMyEvents = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (!user) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) =>
        q.eq("organizerId", user._id)
      )
      .order("desc")
      .collect();
  },
});

export const getAllEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .order("desc")
      .collect();
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") }, // ✅ FIXED

  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (!user) {
      throw new Error("User not authenticated");
    }

    const event = await ctx.db.get(args.eventId); // ✅ FIXED

    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    // Delete registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId) // ✅ FIXED
      )
      .collect();

    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    // Delete event
    await ctx.db.delete(args.eventId); // ✅ FIXED

    // Decrease free event count safely
    if (user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
      });
    }

    return { success: true }; // ✅ FIXED spelling
  },
});
