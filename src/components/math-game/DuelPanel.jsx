import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Swords, Trophy, Clock, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LEVELS } from "./GameConfig";

export default function DuelPanel({ currentUser, onStartDuel }) {
  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState(currentUser?.full_name || "");
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await base44.entities.Duel.list("-created_date", 20);
    setDuels(data);
    setLoading(false);
  };

  const createDuel = async () => {
    if (!name.trim()) return;
    const duel = await base44.entities.Duel.create({
      challenger_name: name.trim(),
      challenger_email: currentUser?.email || "",
      challenger_score: 0,
      status: "open",
      level: selectedLevel,
    });
    setDuels([duel, ...duels]);
    setShowCreate(false);
    onStartDuel(duel, "challenger");
  };

  const joinDuel = async (duel) => {
    const joinName = currentUser?.full_name || "Player 2";
    const updated = await base44.entities.Duel.update(duel.id, {
      opponent_name: joinName,
      opponent_email: currentUser?.email || "",
      status: "open",
    });
    onStartDuel({ ...duel, ...updated }, "opponent");
  };

  const openDuels = duels.filter(d => d.status === "open" && !d.opponent_name);
  const completedDuels = duels.filter(d => d.status === "completed").slice(0, 5);

  return (
    <div>
      {/* Create duel button */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-700">Open Challenges</p>
        <Button
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Challenge
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 mb-4"
        >
          <p className="font-bold text-indigo-800 text-sm mb-3">Create a Duel</p>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="mb-2 rounded-xl"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {LEVELS.slice(0, 6).map(l => (
              <button
                key={l.level}
                onClick={() => setSelectedLevel(l.level)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold border transition-all",
                  selectedLevel === l.level
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200"
                )}
              >
                Lv{l.level}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={createDuel} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <Swords className="w-3.5 h-3.5 mr-1" /> Start Duel
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)} className="rounded-xl">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Open duels */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : openDuels.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No open challenges</p>
          <p className="text-xs mt-1">Create one and wait for an opponent!</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {openDuels.map(duel => (
            <div key={duel.id} className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl p-3.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                {duel.challenger_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{duel.challenger_name}</p>
                <p className="text-xs text-slate-400">Level {duel.level} · Waiting for opponent</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <Button
                  size="sm"
                  onClick={() => joinDuel(duel)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs"
                >
                  <Play className="w-3 h-3 mr-1" /> Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent results */}
      {completedDuels.length > 0 && (
        <>
          <p className="font-bold text-slate-700 mb-3 mt-4">Recent Results</p>
          <div className="space-y-2">
            {completedDuels.map(duel => (
              <div key={duel.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {duel.challenger_name} vs {duel.opponent_name || "?"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {duel.challenger_score} – {duel.opponent_score} · Winner: <span className="font-bold text-emerald-600">{duel.winner_name || "?"}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}