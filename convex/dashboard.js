import { query } from "./_generated/server";
import { v } from "convex/values";

// Get event with detailed stats for dashboard
export const getEventDashboard = query({
  args: { eventId: v.id("events") },

  handler: async (ctx, args) => {
    // ✅ Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // ✅ Find user in database
 const user = await ctx.db
  .query("users")
  .withIndex("by_token", (q) =>
    q.eq("tokenIdentifier", identity.tokenIdentifier)
  )
  .unique();

    if (!user) {
      throw new Error("User not found in database");
    }

    // ✅ Get event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // ✅ Check organizer access
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to view this dashboard");
    }

    // ✅ Get registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // ✅ Stats calculations
    const confirmedRegistrations = registrations.filter(
      (r) => r.status === "confirmed"
    );

    const totalRegistrations = confirmedRegistrations.length;

    const checkedInCount = confirmedRegistrations.filter(
      (r) => r.checkedIn
    ).length;

    const pendingCount = totalRegistrations - checkedInCount;

    // ✅ Revenue (only paid events)
    let totalRevenue = 0;
    if (event.ticketType === "paid" && event.ticketPrice) {
      totalRevenue = checkedInCount * event.ticketPrice;
    }

    // ✅ Check-in rate
    const checkInRate =
      totalRegistrations > 0
        ? Math.round((checkedInCount / totalRegistrations) * 100)
        : 0;

    // ✅ Time calculations
    const now = Date.now();
    const timeUntilEvent = event.startDate - now;

    const hoursUntilEvent = Math.max(
      0,
      Math.floor(timeUntilEvent / (1000 * 60 * 60))
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDay = new Date(event.startDate);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(event.endDate);
    endDay.setHours(0, 0, 0, 0);

    const isEventToday = today >= startDay && today <= endDay;
    const isEventPast = event.endDate < now;

    return {
      event,
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        capacity: event.capacity,
        checkInRate,
        totalRevenue,
        hoursUntilEvent,
        isEventToday,
        isEventPast,
      },
    };
  },
});