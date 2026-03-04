
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await registerForEvent({
        eventId: event._id,
        attendeeName: name,
        attendeeEmail: email,
      });

      setIsSuccess(true);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  // Success state
if (isSuccess) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
        sm:max-w-md
        bg-zinc-900
        text-white
        border border-white/10
        shadow-2xl
        "
      >

        <div className="flex flex-col items-center text-center space-y-4 py-6">

          {/* Success Icon */}
          <div
            className="
            w-16 h-16
            bg-green-500/20
            rounded-full
            flex items-center justify-center
            "
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>


          {/* Text */}
          <div>

            <h2 className="text-2xl font-bold mb-2 text-white">
              You're All Set!
            </h2>

            <p className="text-white/60">
              Your registration is confirmed. Check your Tickets for event
              details and your QR code ticket.
            </p>

          </div>


          {/* Divider */}
          <Separator className="bg-white/10" />


          {/* Buttons */}
          <div className="w-full space-y-2">

            {/* View Ticket Button */}
            <Button
              className="
              w-full
              gap-2
              bg-white
              text-black
              hover:bg-white/90
              "
              onClick={handleViewTicket}
            >
              <Ticket className="w-4 h-4" />
              View My Ticket
            </Button>


            {/* Close Button */}
            <Button
              variant="outline"
              className="
              w-full
              border-white/20
              text-white
              hover:bg-white/10
              "
              onClick={onClose}
            >
              Close
            </Button>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}


  // Registration form
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    
    <DialogContent
      className="
      sm:max-w-md
      bg-zinc-900
      text-white
      border border-white/10
      shadow-2xl
      "
    >

      <DialogHeader>

        <DialogTitle className="text-white">
          Register for Event
        </DialogTitle>

        <DialogDescription className="text-white/60">
          Fill in your details to register for {event.title}
        </DialogDescription>

      </DialogHeader>



      <form onSubmit={handleSubmit} className="space-y-4">


        {/* Event Summary */}
        <div
          className="
          bg-zinc-800
          border border-white/10
          p-4
          rounded-lg
          space-y-2
          "
        >

          <p className="font-semibold text-white">
            {event.title}
          </p>

          <p className="text-sm text-white/60">

            {event.ticketType === "free" ? (

              "Free Event"

            ) : (

              <>
                Price: ₹{event.ticketPrice}
                <span className="text-xs text-white/40">
                  {" "}
                  (Pay at venue)
                </span>
              </>

            )}

          </p>

        </div>



        {/* Name */}
        <div className="space-y-2">

          <Label
            htmlFor="name"
            className="text-white/70"
          >
            Full Name
          </Label>

          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="John Doe"
            required
            className="
            bg-zinc-800
            border-white/10
            text-white
            placeholder:text-white/40
            focus-visible:ring-white/20
            "
          />

        </div>
        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-white/70"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
            setEmail(e.target.value)
            }
            placeholder="john@example.com"
            required
            className="
            bg-zinc-800
            border-white/10
            text-white
           
            focus-visible:ring-white/20
            "
          />
        </div>
        {/* Terms */}
        <p className="text-xs text-white/40">
          By registering, you agree to receive event updates and reminders via email.
        </p>
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="
            flex-1
            border-white/20
            text-black  
          
            "
          >
            Cancel
          </Button>
          {/* Register */}
          <Button
            type="submit"
            disabled={isLoading}
            className="
            flex-1
            gap-2
            bg-white
            text-black
            hover:bg-white/90
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                Register
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
}