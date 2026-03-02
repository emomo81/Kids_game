import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CalendarDays, Flame, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TODAY = new Date().toISOString().split("T")[0];

export default function DailyChallengeCard({ onStartDaily }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrCreate();
  }, []);

  const loadOrCreate = async () => {
    const records = await base44.entities.DailyChallenge.filter({ challenge_date: TODAY });
    if (records.length > 0) {
      setRecord(records[0]);
    } else {
      // Check if there was a record yesterday to compute streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yd = yesterday.toISOString().split("T")[0];
      const prev = await base44.entities.DailyChallenge.filter({ challenge_date: yd });
      const prevStreak = prev.length > 0 && prev[0].completed ? (prev[0].daily_streak || 0) : 0;
      const created = await base44.entities.DailyChallenge.create({
        challenge_date: TODAY,
        completed: false,
        score: 0,
        daily_streak: prevStreak,
      });
      setRecord(created);
    }
    setLoading(false);
  };

  if (loading) return <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />;

  const isCompleted = record?.completed;
  const streak = record?.daily_streak || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 border-2 relative overflow-hidden",
        isCompleted
          ? "bg-emerald-50 border-emerald-200"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
      )}
    >
      {/* bg decoration */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-amber-400" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            isCompleted ? "bg-emerald-100" : "bg-amber-100"
          )}>
            {isCompleted
              ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              : <CalendarDays className="w-6 h-6 text-amber-600" />
            }
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Daily Challenge</p>
            <p className="text-xs text-slate-500">
              {isCompleted ? `Completed! Score: ${record.score}` : "10 mixed problems · Special badge!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 rounded-xl px-2.5 py-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-black text-orange-600">{streak}</span>
            </div>
          )}
          {!isCompleted ? (
            <Button
              size="sm"
              onClick={() => onStartDaily(record)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold"
            >
              <Play className="w-3.5 h-3.5 mr-1" /> Play
            </Button>
          ) : (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Done!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export async function markDailyComplete(score) {
  const records = await base44.entities.DailyChallenge.filter({ challenge_date: TODAY });
  if (records.length > 0 && !records[0].completed) {
    const newStreak = (records[0].daily_streak || 0) + 1;
    await base44.entities.DailyChallenge.update(records[0].id, {
      completed: true,
      score,
      daily_streak: newStreak,
    });
    return newStreak;
  }
  return 0;
}