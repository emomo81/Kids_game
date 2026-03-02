import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StarDisplay from "./StarDisplay";
import { ArrowRight, RotateCcw, Home, Trophy, XCircle } from "lucide-react";

export default function LevelComplete({ levelNum, result, newBadges, onNextLevel, onRetry, onHome }) {
    const { correct, total, stars, failed } = result;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 text-slate-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 max-w-sm w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-4"
                >
                    {failed ? (
                        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-rose-500" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                            <Trophy className="w-10 h-10 text-amber-500" />
                        </div>
                    )}
                </motion.div>

                <h2 className="text-2xl font-black text-slate-800 mb-1">
                    {failed ? "Almost There!" : "Level Complete!"}
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    {failed ? "Don't give up, try again!" : `You got ${correct} out of ${total} correct!`}
                </p>

                {/* Stars */}
                {!failed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center mb-6"
                    >
                        <StarDisplay count={stars} max={3} size="lg" />
                    </motion.div>
                )}

                {/* New badges */}
                {newBadges && newBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200"
                    >
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">New Badges Earned!</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {newBadges.map((badge) => (
                                <span key={badge.id} className="bg-white rounded-xl px-3 py-1.5 text-sm shadow-sm border border-amber-100">
                                    {badge.icon} {badge.name}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Score */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-2xl font-black text-indigo-600">{correct}/{total}</p>
                            <p className="text-xs text-slate-500">Correct</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-500">{result.streak}</p>
                            <p className="text-xs text-slate-500">Best Streak</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    {!failed && levelNum < 10 && (
                        <Button onClick={onNextLevel} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl h-12 font-bold">
                            Next Level <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                    <Button onClick={onRetry} variant="outline" className="w-full rounded-xl h-12 font-bold">
                        <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                    </Button>
                    <Button onClick={onHome} variant="ghost" className="w-full rounded-xl h-10 text-slate-500">
                        <Home className="w-4 h-4 mr-2" /> Back to Map
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}