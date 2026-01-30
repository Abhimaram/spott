"use client";

import {SignInButton,   UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { Building, Plus, Ticket } from "lucide-react";

const Header = () => {
   
 const {  isLoading }  = useStoreUser();

 const[showUpgradeModal , setShowUpgradeModal] = useState(false)

  return(
    <>
   <nav className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-xl z-20 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
     {/* Logo */}
     <Link href = {'/'} className="flex items-center">
     
       <Image
        src="/spott.png"
        alt="Spott logo"
        width={500} 
        height={500}
        className="w-full h-11"
        priority
         />  

         {/* pro badge */}
        </Link>

       {/* Search & Location - Desktop only */}


       {/* Right Side Actions */}
      <div className="flex items-center">
           
      <Button variant={"ghost"} size="sm" onClick={() => setShowUpgradeModal(true)}>
       Pricing
      </Button>
        <Button variant={"ghost"} size="sm" asChild className={"mr-2"}>
          <Link href="/explore">
          Explore
          </Link>
             </Button>


              <Authenticated>
               <Button size="sm" asChild   className="flex gap-2 mr-4 bg-white text-black hover:bg-gray-200 rounded-full px-6">
               <Link href="/create-event">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Event</span>
           </Link>
           </Button> 

          <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link 
             label="My Tickets"
             labelIcon = {<Ticket size={16}/>}
             href="/mytickets"
            />
           
            <UserButton.Link 
             label="My Events"
             labelIcon = {<Building size={16}/>}
             href="/my-events"
            />

            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
           </UserButton>

         </Authenticated>

        
         <Unauthenticated>
              <SignInButton mode ="modal">
           <Button size="sm" style={{ backgroundColor: "white", color: "black", borderRadius: "9999px", padding: "8px 24px", fontWeight: 500, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", cursor: "pointer" }}>Sign In</Button>

              </SignInButton>
            </Unauthenticated>
           
      </div>
     </div>

     {/* Mobile Search & Location */}

     {/* Loader */} 
     { isLoading &&  (
     <div className="absolute bottom-0 left-0 w-full">
      <BarLoader width={'100%'} color="#a855f7" />
     </div>
    )}
    </nav>

    {/* Modals */}

    </>
  )
}

export default Header;