import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/* ----------------------------------------
   STORE USER (on sign-in)
----------------------------------------- */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          updatedAt: Date.now(),
        });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl ?? "",

      // ✅ CORRECT FIELD NAME
      hasCompletedOnboarding: false,

      freeEventsCreated: 0,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/* ----------------------------------------
   GET CURRENT USER
----------------------------------------- */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

  
    return user ?? null;
  },
});

/* ----------------------------------------
   COMPLETE ONBOARDING
----------------------------------------- */
export const completeOnboarding = mutation({
  args: {
    interests: v.array(v.string()),
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
  },

  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (!user) {
      throw new Error("User not found");
    }

    if (args.interests.length < 3) {
      throw new Error("Select at least 3 interests");
    }

    await ctx.db.patch(user._id, {
      interests: args.interests,
      location: args.location,

      // ✅ STORE A VALUE, NOT A TYPE
      hasCompletedOnboarding: true,

      updatedAt: Date.now(),
    });

    return user._id;
  },
});
