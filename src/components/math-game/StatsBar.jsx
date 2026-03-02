import React from "react";
import { Star, Zap, Target, Trophy } from "lucide-react";

export default function StatsBar({ progress }) {
  const stats = [
    { icon: Star, label: "Stars", value: progress?.total_stars || 0, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Target, label: "Solved", value: progress?.problems_solved || 0, color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: Zap, label: "Streak", value: progress?.best_streak || 0, color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Trophy, label: "Badges", value: (progress?.badges || []).length, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 text-center`}>
          <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
          <p className="text-lg font-black text-slate-800">{stat.value}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}