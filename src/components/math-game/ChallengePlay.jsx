import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function generateCustomProblem(operations, minNum, maxNum) {
    const ops = operations.split("").filter(o => ["+", "-", "×"].includes(o));
    const op = ops[Math.floor(Math.random() * ops.length)] || "+";
    let a, b, answer;
    if (op === "+") {
        a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        answer = a + b;
    } else if (op === "-") {
        a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        b = Math.floor(Math.random() * (a - minNum + 1)) + minNum;
        if (b > a) [a, b] = [b, a];
        answer = a - b;
    } else {
        a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        answer = a * b;
    }
    const wrong = new Set();
    while (wrong.size < 3) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const w = answer + (offset === 0 ? 1 : offset);
        if (w !== answer && w >= 0) wrong.add(w);
    }
    return { a, b, op, answer, options: [...wrong, answer].sort(() => Math.random() - 0.5) };
}

export default function ChallengePlay({ challenge, role, onComplete, onExit }) {
    const total = challenge.num_problems || 5;
    const [problems] = useState(() =>
        Array.from({ length: total }, () =>
            generateCustomProblem(challenge.operations || "+", challenge.min_num || 1, challenge.max_num || 10)
        )
    );
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const problem = problems[idx];
    const progress = (idx / total) * 100;

    const handleAnswer = async (option) => {
        if (showResult) return;
        setSelected(option);
        const right = option === problem.answer;
        setIsCorrect(right);
        setShowResult(true);
        const newScore = right ? score + 1 : score;
        if (right) setScore(newScore);

        setTimeout(async () => {
            if (idx + 1 >= total) {
                const updateData = role === "challenger"
                    ? { challenger_score: newScore }
                    : { opponent_score: newScore, status: "completed" };

                const fresh = await base44.entities.FriendChallenge.filter({ id: challenge.id });
                const current = fresh[0] || challenge;

                if (role === "opponent") {
                    const chalScore = current.challenger_score || 0;
                    updateData.winner_name = newScore >= chalScore ? current.to_name : current.from_name;
                } else if (role === "challenger") {
                    // challenger plays first; mark as accepted so opponent knows
                    updateData.status = "accepted";
                }

                await base44.entities.FriendChallenge.update(challenge.id, updateData);
                onComplete({ score: newScore, total, winner: updateData.winner_name });
            } else {
                setIdx(i => i + 1);
                setSelected(null);
                setShowResult(false);
            }
        }, 900);
    };

    return (
        <div className="min-h-screen p-4 flex flex-col relative z-10 text-slate-800">
            <div className="max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-500">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Exit
                    </Button>
                    <div className="flex items-center gap-2 text-sm font-bold text-pink-700">
                        <Swords className="w-4 h-4" /> Friend Challenge
                    </div>
                    <div className="text-sm font-black text-violet-600">{score} pts</div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <div className="flex flex-col items-center">
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
                                    {problem.a} <span className="text-pink-500">{problem.op}</span> {problem.b}
                                </div>
                                <div className="text-2xl text-slate-400 mt-2">= ?</div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">{idx + 1} / {total}</p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        {problem.options.map((option, i) => {
                            let cls = "bg-white border-2 border-slate-200 text-slate-800 hover:border-pink-400 hover:bg-pink-50";
                            if (showResult) {
                                if (option === problem.answer) cls = "bg-emerald-500 border-2 border-emerald-500 text-white";
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