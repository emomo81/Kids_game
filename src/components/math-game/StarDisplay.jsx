import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarDisplay({ count = 0, max = 3, size = "md" }) {
  const sizeClass = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass, "transition-all duration-300",
            i < count
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
              : "text-slate-300"
          )}
        />
      ))}
    </div>
  );
}