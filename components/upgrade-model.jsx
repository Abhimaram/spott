import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Sparkles } from "lucide-react";
import { PricingTable } from "@clerk/nextjs";
import { Button } from "./ui/button";

const UpgradeModel = ({ isOpen, onClose, trigger = "limit" }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-2xl
          bg-zinc-900
          border border-white/10
          text-white
        "
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <DialogTitle className="text-lg font-semibold text-white">
              Upgrade to Pro
            </DialogTitle>
          </div>

          <DialogDescription className="text-sm text-zinc-400">
            {trigger === "header" && "Create Unlimited Events with Pro! "}
            {trigger === "limit" && "You've reached your free event limit. "}
            {trigger === "color" && "Custom theme colors are a Pro feature. "}
            Unlock unlimited events and premium features!
          </DialogDescription>
        </DialogHeader>

        <PricingTable
        checkoutProps={{
          appearance: {
            elements:{
              drawerRoot:{
                zIndex:2000,
              },
            },
          },
        }}
        />

     <div className="mt-4">
  <Button
    onClick={onClose}
    className="
      w-full
      bg-zinc-800
      hover:bg-zinc-700
      text-zinc-300
      hover:text-white
      border border-white/10
      rounded-md
      py-3
    "
  >
    Maybe Later
  </Button>
</div>

      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModel;
