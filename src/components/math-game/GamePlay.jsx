import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVELS, generateProblem } from "./GameConfig";

// Adaptive difficulty: track recent 5 answers, adjust multiplier
function useDifficulty() {
    const [history, setHistory] = useState([]); // true=correct, false=wrong
    const [mult, setMult] = useState(1.0);

    const record = (correct) => {
        setHistory(prev => {
            const next = [...prev, correct].slice(-5);
            const rightCount = next.filter(Boolean).length;
            // >= 4/5 correct → harder, <= 1/5 correct → easier
            if (next.length >= 3) {
                if (rightCount >= 4) setMult(m => Math.min(1.6, +(m + 0.15).toFixed(2)));
                else if (rightCount <= 1) setMult(m => Math.max(0.4, +(m - 0.15).toFixed(2)));
            }
            return next;
        });
    };
    return { mult, record };
}

export default function GamePlay({ levelNum, onComplete, onExit, isDaily, isDarkMode }) {
    const config = LEVELS[levelNum - 1];
    const { mult, record } = useDifficulty();
    const [problemIndex, setProblemIndex] = useState(0);
    const [problem, setProblem] = useState(null);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [shakeWrong, setShakeWrong] = useState(false);

    const totalProblems = isDaily ? 10 : (config?.problems || 5);

    const nextProblem = useCallback(() => {
        setProblem(generateProblem(levelNum, mult));
        setSelected(null);
        setShowResult(false);
        setShakeWrong(false);
    }, [levelNum, mult]);

    useEffect(() => {
        nextProblem();
    }, [nextProblem]);

    const handleAnswer = (option) => {
        if (showResult || gameOver) return;
        setSelected(option);
        setShowResult(true);

        const isRight = option === problem.answer;
        setIsCorrectAnswer(isRight);
        record(isRight);

        if (isRight) {
            setCorrect((c) => c + 1);
            setStreak((s) => s + 1);
        } else {
            setStreak(0);
            setLives((l) => l - 1);
            setShakeWrong(true);
        }

        setTimeout(() => {
            const newLives = isRight ? lives : lives - 1;
            const newProblemIndex = problemIndex + 1;

            if (newLives <= 0) {
                setGameOver(true);
                const stars = correct >= totalProblems * 0.8 ? 3 : correct >= totalProblems * 0.5 ? 2 : correct >= 1 ? 1 : 0;
                onComplete({ correct, total: newProblemIndex, stars, streak: isRight ? streak + 1 : streak, failed: true });
            } else if (newProblemIndex >= totalProblems) {
                setGameOver(true);
                const finalCorrect = isRight ? correct + 1 : correct;
                const stars = finalCorrect >= totalProblems * 0.9 ? 3 : finalCorrect >= totalProblems * 0.6 ? 2 : 1;
                onComplete({ correct: finalCorrect, total: totalProblems, stars, streak: isRight ? streak + 1 : streak, failed: false });
            } else {
                setProblemIndex(newProblemIndex);
                nextProblem();
            }
        }, 1200);
    };

    if (!problem || !config) return null;

    const progress = ((problemIndex) / totalProblems) * 100;

    return (
        <div className={`min-h-screen p-4 flex flex-col relative z-10 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
            {/* Header */}
            <div className="max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={onExit} className={isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500"}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Exit
                    </Button>
                    <div className="text-center">
                        <p className={`text-xs uppercase tracking-wider font-medium ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>Level {levelNum}</p>
                        <p className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-700"}`}>{config.name}</p>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart
                                key={i}
                                className={cn("w-5 h-5 transition-all",
                                    i < lives ? "fill-rose-500 text-rose-500" : "text-slate-300"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-8">
                    <span>{problemIndex + 1} of {totalProblems}</span>
                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                        {mult > 1.1 ? "🔥 Hard mode" : mult < 0.9 ? "💡 Easy mode" : ""}
                        {streak >= 2 && <span className="text-amber-500 flex items-center gap-1 ml-1"><Zap className="w-3 h-3" />{streak}🔥</span>}
                    </span>
                </div>
            </div>

            {/* Problem display */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={problemIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn("text-center mb-12", shakeWrong && "animate-shake")}
                    >
                        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 px-10 py-8 inline-block">
                            <div className="text-6xl md:text-7xl font-black text-slate-800 tracking-tight">
                                {problem.a} <span className="text-indigo-500">{problem.op}</span> {problem.b}
                            </div>
                            <div className="text-2xl text-slate-400 mt-2 font-medium">= ?</div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Answer options */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    {problem.options.map((option, idx) => {
                        const isSelected = selected === option;
                        const isAnswer = option === problem.answer;
                        let btnClass = "bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50";

                        if (showResult) {
                            if (isAnswer) {
                                btnClass = "bg-emerald-500 border-2 border-emerald-500 text-white scale-105";
                            } else if (isSelected && !isAnswer) {
                                btnClass = "bg-rose-500 border-2 border-rose-500 text-white";
                            } else {
                                btnClass = "bg-slate-100 border-2 border-slate-200 text-slate-400";
                            }
                        }

                        return (
                            <motion.button
                                key={`${problemIndex}-${idx}`}
                                whileTap={!showResult ? { scale: 0.95 } : {}}
                                onClick={() => handleAnswer(option)}
                                disabled={showResult}
                                className={cn(
                                    "rounded-2xl py-5 text-2xl font-bold transition-all duration-300 shadow-sm",
                                    btnClass
                                )}
                            >
                                {option}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6"
                        >
                            <p className={cn(
                                "text-lg font-bold",
                                isCorrectAnswer ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {isCorrectAnswer
                                    ? ["Awesome! 🎉", "Great job! ⭐", "Perfect! 💪", "You rock! 🚀"][Math.floor(Math.random() * 4)]
                                    : `Oops! The answer was ${problem.answer}`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}