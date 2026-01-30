import { Organization } from "@clerk/nextjs/dist/types/server";
import { Title } from "@radix-ui/react-dialog";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"; 
import { QrCode } from "lucide-react"; 
import { register } from "next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup";

export default defineSchema({
  // Users Table
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    email: v.string(),
    imageUrl: v.optional(v.string()),

    // Onboarding
    hascompletedOnboarding: v.boolean(),

    location: v.optional(
      v.object({
        city: v.string(),
        state: v.optional(v.string()),
        country: v.string(),
      })
    ),

    interests: v.optional(v.array(v.string())), // Min 3 categories

    // Organizer tracking
    freeEventsCreated: v.number(), // Track free event limit (1 free)

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  events: defineTable({
  title: v.string(),
  description: v.string(),
  slug: v.string(), // URL friendly unique identifier

  // Organizer
  organizerId: v.id("users"),
  organizerName: v.string(),

  //Event details
  category: v.string(),
  tags:v.array(v.string()),

  //Date and Time
  startDate: v.number(),
  endDate: v.number(),
  timeZone: v.string(),

  // Location
  locationType: v.union(v.literal("physical"),v.literal("online")),
  venue: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),


 //Capacity & Ticketing
 capacity:v.number(),
 ticketType: v.union(v.literal("free"),v.literal("paid")),
 ticketPrice: v.optional(v.number()),     //paid at event offline
 registrationCount:v.number(),

 //Custumization
 coverImage: v.optional(v.string()),
 themeColor: v.optional(v.string()),

 //Timestamps
 createdAt:v.number(),
 updatedAt:v.number(),
 })
  .index("by_organizer", ["organizerId"])
  .index("by_category", ["category"])
  .index("by_start_date", ["startDate"])
  .index("by_slug", ["slug"])
  .index("search_title",{searchfield: "title" }),

  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),

    //Attend info
   attendeeName: v.string(),
   attendeeEmail: v.string(),

   //Qr Code for check-in
   QrCode:v.string(), // Unique Id for Qr

   //Check-in
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),

    //status
    status: v.union(v.literal("registered"),v.literal("cancelled")),

    registeredAT: v.number(),
  })
   .index("by_event", ["eventId"])
   .index("by_user", ["userId"])
   .index("by_event_user", ["eventId", "userId"])
   .index("by_qr_code", ["qrCode"]),

});
