import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVELS, generateProblem } from "./GameConfig";

const TOTAL_PROBLEMS = 8;

export default function DuelPlay({ duel, role, onComplete, onExit }) {
    const config = LEVELS[(duel.level || 1) - 1];
    const [problems] = useState(() => Array.from({ length: TOTAL_PROBLEMS }, () => generateProblem(duel.level || 1)));
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [done, setDone] = useState(false);

    const problem = problems[idx];

    const handleAnswer = async (option) => {
        if (showResult || done) return;
        setSelected(option);
        const right = option === problem.answer;
        setIsCorrect(right);
        setShowResult(true);
        const newScore = right ? score + 1 : score;
        if (right) setScore(newScore);

        setTimeout(async () => {
            if (idx + 1 >= TOTAL_PROBLEMS) {
                setDone(true);
                // Save score
                const updateData = role === "challenger"
                    ? { challenger_score: newScore }
                    : { opponent_score: newScore };

                // Check if both have played
                const fresh = await base44.entities.Duel.filter({ id: duel.id });
                const current = fresh[0] || duel;

                let winner = null;
                if (role === "challenger") {
                    const oppScore = current.opponent_score || 0;
                    if (current.opponent_name) {
                        winner = newScore >= oppScore ? current.challenger_name : current.opponent_name;
                        updateData.status = "completed";
                        updateData.winner_name = winner;
                    }
                } else {
                    const chalScore = current.challenger_score || 0;
                    winner = newScore >= chalScore ? current.opponent_name : current.challenger_name;
                    updateData.status = "completed";
                    updateData.winner_name = winner;
                }

                await base44.entities.Duel.update(duel.id, updateData);
                onComplete({ score: newScore, total: TOTAL_PROBLEMS, winner });
            } else {
                setIdx(i => i + 1);
                setSelected(null);
                setShowResult(false);
            }
        }, 1000);
    };

    const progress = (idx / TOTAL_PROBLEMS) * 100;

    return (
        <div className="min-h-screen p-4 flex flex-col relative z-10 text-slate-800">
            <div className="max-w-lg mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-500">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Exit
                    </Button>
                    <div className="flex items-center gap-2 text-sm font-bold text-violet-700">
                        <Swords className="w-4 h-4" /> Duel · Level {duel.level}
                    </div>
                    <div className="text-sm font-black text-indigo-600">{score} pts</div>
                </div>

                {/* Progress */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                {/* Problem */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center mb-10"
                        >
                            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-10 py-8 inline-block">
                                <div className="text-6xl font-black text-slate-800">
                                    {problem.a} <span className="text-violet-500">{problem.op}</span> {problem.b}
                                </div>
                                <div className="text-2xl text-slate-400 mt-2">= ?</div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        {problem.options.map((option, i) => {
                            let cls = "bg-white border-2 border-slate-200 text-slate-800 hover:border-violet-400 hover:bg-violet-50";
                            if (showResult) {
                                if (option === problem.answer) cls = "bg-emerald-500 border-2 border-emerald-500 text-white scale-105";
                                else if (option === selected) cls = "bg-rose-500 border-2 border-rose-500 text-white";
                                else cls = "bg-slate-100 border-2 border-slate-200 text-slate-400";
                            }
                            return (
                                <motion.button
                                    key={`${idx}-${i}`}
                                    whileTap={!showResult ? { scale: 0.95 } : {}}
                                    onClick={() => handleAnswer(option)}
                                    disabled={showResult}
                                    className={cn("rounded-2xl py-5 text-2xl font-bold transition-all duration-200 shadow-sm", cls)}
                                >
                                    {option}
                                </motion.button>
                            );
                        })}
                    </div>

                    {showResult && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("mt-5 text-lg font-bold", isCorrect ? "text-emerald-600" : "text-rose-600")}
                        >
                            {isCorrect ? "Correct! ⚡" : `Answer: ${problem.answer}`}
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    );
}