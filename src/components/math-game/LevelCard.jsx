import React from "react";
import { Lock, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import StarDisplay from "./StarDisplay";

const levelColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-green-600",
  "from-lime-500 to-emerald-600",
  "from-yellow-500 to-amber-600",
  "from-orange-500 to-red-500",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-yellow-600",
];

export default function LevelCard({ level, isUnlocked, starsEarned, isCompleted, onClick }) {
  const colorIdx = (level.level - 1) % levelColors.length;

  return (
    <button
      onClick={() => isUnlocked && onClick(level.level)}
      disabled={!isUnlocked}
      className={cn(
        "relative group rounded-2xl p-5 text-left transition-all duration-300 border-2",
        isUnlocked
          ? "bg-white hover:shadow-xl hover:-translate-y-1 border-slate-200 hover:border-slate-300 cursor-pointer"
          : "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
      )}
    >
      {/* Level number badge */}
      <div className={cn(
        "absolute -top-3 -left-2 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br",
        isUnlocked ? levelColors[colorIdx] : "from-slate-400 to-slate-500"
      )}>
        {level.level}
      </div>

      {/* Completion check */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2">
          <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-50" />
        </div>
      )}

      <div className="mt-3">
        <h3 className={cn(
          "font-bold text-base",
          isUnlocked ? "text-slate-800" : "text-slate-400"
        )}>
          {level.name}
        </h3>
        <p className={cn(
          "text-xs mt-1",
          isUnlocked ? "text-slate-500" : "text-slate-400"
        )}>
          {level.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <StarDisplay count={starsEarned || 0} max={3} size="sm" />
          {isUnlocked ? (
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md transition-transform group-hover:scale-110",
              levelColors[colorIdx]
            )}>
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
          ) : (
            <Lock className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
    </button>
  );
}