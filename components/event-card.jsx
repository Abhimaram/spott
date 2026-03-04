import React from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin, QrCode, Trash2, Users, X,  Eye} from "lucide-react";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";



const EventCard = ({
  event,
  onClick,
  onDelete, 
  variant = "grid",
  action = null, //"events" | "ticket" | null
  className = "",
}) => {

  if (variant === "list") {
    return (
      <Card
        className={`overflow-hidden group pt-0 
        bg-[#0f0f0f] border border-white/10 rounded-xl
        transition-all hover:shadow-lg hover:border-purple-500/50   
        ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-3 flex gap-3">
          <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden relative">
            {event.coverImage ? (
              <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl"
                style={{ backgroundColor: event.themeColor }}
              >
                {getCategoryIcon(event.category)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 text-white line-clamp-2 group-hover:text-purple-400 transition">
              {event.title}
            </h3>

            <p className="text-xs text-gray-400 mb-1">
              {format(event.startDate, "EEE dd MMM, HH:mm")}
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span>
                {event.locationTypo === "online" ? "Online Event" : event.city}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>{event.registrationCount} attending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }



  return (
    <Card
      onClick={onClick}
      className={`group bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden
      transition-all hover:shadow-lg hover:border-purple-500/50 cursor-pointer
      p-0 ${className}`}
    >

      {/* Taller image like reference */}
      <div className="relative h-56 w-full overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: event.themeColor }}
          >
            {getCategoryIcon(event.category)}
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge variant="secondary">
            {event.ticketType === "free" ? "Free" : "Paid"}
          </Badge>
        </div>
      </div>


      <CardContent className="p-5 space-y-4 text-white transition-colors duration-300">

        <Badge
          variant="outline"
          className="w-fit bg-black/40 border-white/30 text-white
          group-hover:text-purple-400 transition-colors duration-300"
        >
          {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
        </Badge>

        <h3
          className="font-semibold text-lg leading-snug line-clamp-2 text-white
          group-hover:text-purple-400 transition-colors duration-300"
        >
          {event.title}
        </h3>

      <div className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <span>{format(event.startDate, "PPP")}</span>
    </div>

    <div className="flex items-center gap-2">
    <MapPin className="w-4 h-4" />
     <span className="line-clamp-1">
    {event.locationType === "online"
      ? "Online Event"
      : `${event.city}, ${event.state || event.country}`}
  </span>
</div>

   <div className="flex items-center gap-2">
   <Users className="w-4 h-4" />
   <span>
    {event.registrationCount} / {event.capacity} registered
   </span>
    </div>
   </div>

 {action && (
  <div className="flex items-center gap-2 pt-2">
    
    {/* Main action button */}
    <Button
      variant="outline"
      size="sm"
      className="flex-1 bg-zinc-900 border-white/10 hover:bg-zinc-800hover:text-white"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {action === "event" ? (
        <>
          <Eye className="w-4 h-4 mr-2" />
          View
        </>
      ) : (
        <>
          <QrCode className="w-4 h-4 mr-2" />
          Show Ticket
        </>
      )}
    </Button>

    {/* Delete / Cancel button */}
    {onDelete && (
      <Button
        variant="outline"
        size="icon"
        className="border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event._id);
        }}
      >
        {action === "event" ? (
          <Trash2 className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" color="red" />
        )}
      </Button>
    )}
  </div>
)}
      </CardContent>
    </Card>
  );
};

export default EventCard;
