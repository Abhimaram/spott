import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";


const generateQRCode = () => {
return `EVT-${Date.now()}-${Math.random().toString(36).substr(2,9).toUpperCase()}`;
};

export const registerForEvent = mutation({
args:{
eventId:v.id("events"),
attendeeName:v.string(),
attendeeEmail:v.string(),
},
handler:async(ctx,args)=>{
const user=await ctx.runQuery(internal.users.getCurrentUser);

if(!user){
throw new Error("User not authenticated");
}

const event=await ctx.db.get(args.eventId);

if(!event){
throw new Error("Event not found");
}

if(event.registrationCount>=event.capacity){
throw new Error("Event is full");
}

const existingRegistration=await ctx.db
.query("registrations")
.withIndex("by_event_user",(q)=>
q.eq("eventId",args.eventId).eq("userId",user._id)
)
.unique();

if(existingRegistration){
throw new Error("You are already registered for this event");
}

const qrCode=generateQRCode();

const registrationId=await ctx.db.insert("registrations",{
eventId:args.eventId,
userId:user._id,
attendeeName:args.attendeeName,
attendeeEmail:args.attendeeEmail,
qrCode:qrCode,
checkedIn:false,
status:"confirmed",
registeredAt:Date.now(),
});

await ctx.db.patch(args.eventId,{
registrationCount:event.registrationCount+1,
});

return registrationId;
},
});

export const checkRegistration=query({
args:{
eventId:v.id("events"),
},
handler:async(ctx,args)=>{
const user=await ctx.runQuery(internal.users.getCurrentUser);

if(!user){
return null;
}

const registration=await ctx.db
.query("registrations")
.withIndex("by_event_user",(q)=>
q.eq("eventId",args.eventId).eq("userId",user._id)
)
.unique();

return registration;
},
});

export const getMyRegistrations=query({
handler:async(ctx)=>{

const user=await ctx.runQuery(internal.users.getCurrentUser);

if(!user){
return [];
}

const registrations=await ctx.db
.query("registrations")
.withIndex("by_user",(q)=>q.eq("userId",user._id))
.order("desc")
.collect();

const registrationWithEvents=await Promise.all(
registrations.map(async(reg)=>{
const event=await ctx.db.get(reg.eventId);
return{...reg,event};
})
);

return registrationWithEvents;
},
});

export const cancelRegistration=mutation({
args:{
registrationId:v.id("registrations"),
},
handler:async(ctx,args)=>{

const user=await ctx.runQuery(internal.users.getCurrentUser);

if(!user){
throw new Error("User not authenticated");
}

const registration=await ctx.db.get(args.registrationId);

if(!registration){
throw new Error("Registration not found");
}

if(registration.userId!==user._id){
throw new Error("You can only cancel your own registrations");
}

const event=await ctx.db.get(registration.eventId);

if(!event){
throw new Error("Event not found");
}


//Update registration status
await ctx.db.patch(args.registrationId,{
status:"cancelled",
});

//Decrement event registration count 
if(event.registrationCount>0){
await ctx.db.patch(registration.eventId,{
registrationCount:event.registrationCount-1,
});
}

return{success:true};
},
});

export const checkInAttendee=mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
      const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();
     if (!registration) {
      throw new Error("Invalid QR Code");
    }
    const  event = await ctx.db.get(registration.eventId);  
    if (!event) {
      throw new Error("Event not found");
    }
     //check if user organizer
    if(event.organizerId !== user._id) {
      throw new Error("You are not authorized to check in attendees");  
    }
    // check if user is already checked in
if (registration.checkedIn) {
  return {
    success: false,
    message: "Already Checked-In",
    registration,
  };
}
//Check in
await ctx.db.patch(registration._id, {
  checkedIn: true,
  checkedInAt: Date.now(),
  });
  return {
  success: true,
  message: "Check-in successful",
  registration: {
    ...registration,
    checkedIn: true,
    checkedInAt: Date.now(),
  },
};
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only organizer can view
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to view registrations");
    }

    // ✅ Just return registrations (READ ONLY)
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return registrations;
  },
});