"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";


export function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

const generateEvent = async () => {
  setLoading(true);

  try {
    const response = await fetch("/api/generate-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    onEventGenerated(data);
    toast.success("Event details generated! Review and customize below.");
    setIsOpen(false);
    setPrompt("");
  } catch (error) {
    toast.error("Failed to generate event. Please try again.");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-900/40 text-white border border-blue-500/30 hover:bg-blue-900/60 transition-all">
          Generate with AI
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[#0f0f0f] text-white border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Event Creator
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Describe your event idea and let AI create the details for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A tech meetup about React 19 for developers in Bangalore. It should cover new features like Actions and use hook improvements..."
            rows={4}
            className="bg-[#181818] border border-zinc-700 rounded-lg resize-none focus:ring-0 focus:outline-none"
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-[#181818] hover:bg-[#222] text-white border border-zinc-700"
            >
              Cancel
            </Button>

            <Button
              onClick={generateEvent}
              disabled={loading || !prompt.trim()}
              className="flex-1 bg-white text-black hover:bg-gray-200 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
