import React from "react";
import { BADGES } from "./GameConfig";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export default function BadgesPanel({ earnedBadges = [] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {BADGES.map((badge) => {
        const isEarned = earnedBadges.includes(badge.id);
        return (
          <div
            key={badge.id}
            className={cn(
              "rounded-2xl p-3 text-center transition-all border-2",
              isEarned
                ? "bg-white border-amber-200 shadow-sm"
                : "bg-slate-50 border-slate-200 opacity-50"
            )}
          >
            <div className="text-2xl mb-1">
              {isEarned ? badge.icon : <Lock className="w-5 h-5 text-slate-400 mx-auto" />}
            </div>
            <p className={cn("text-xs font-bold", isEarned ? "text-slate-700" : "text-slate-400")}>
              {badge.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{badge.description}</p>
          </div>
        );
      })}
    </div>
  );
}