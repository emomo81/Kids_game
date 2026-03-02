import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, Zap, Target, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];
const MEDAL_BG = ["bg-amber-50 border-amber-200", "bg-slate-50 border-slate-200", "bg-orange-50 border-orange-200"];

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("total_stars");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await base44.entities.LeaderboardEntry.list("-total_stars", 20);
    setEntries(data);
    setLoading(false);
  };

  const sorted = [...entries].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  const sortOptions = [
    { key: "total_stars", label: "Stars", icon: Star },
    { key: "problems_solved", label: "Problems", icon: Target },
    { key: "best_streak", label: "Streak", icon: Zap },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No players yet!</p>
        <p className="text-sm mt-1">Be the first on the leaderboard.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex gap-2 mb-4">
        {sortOptions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
              sortBy === key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            )}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((entry, idx) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-3.5 border-2 transition-all",
              idx < 3 ? MEDAL_BG[idx] : "bg-white border-slate-100"
            )}
          >
            {/* Rank */}
            <div className="w-8 text-center">
              {idx < 3
                ? <Medal className={cn("w-5 h-5 mx-auto", MEDAL_COLORS[idx])} />
                : <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
              }
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {entry.player_name?.[0]?.toUpperCase() || "?"}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{entry.player_name}</p>
              <p className="text-xs text-slate-400">{entry.levels_completed || 0} levels done</p>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <p className="font-black text-slate-800">
                {entry[sortBy] || 0}
                {sortBy === "total_stars" && " ⭐"}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{sortOptions.find(s => s.key === sortBy)?.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}