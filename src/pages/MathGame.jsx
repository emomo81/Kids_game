import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LEVELS, BADGES } from "../components/math-game/GameConfig";
import LevelCard from "../components/math-game/LevelCard";
import StatsBar from "../components/math-game/StatsBar";
import BadgesPanel from "../components/math-game/BadgesPanel";
import GamePlay from "../components/math-game/GamePlay";
import LevelComplete from "../components/math-game/LevelComplete";
import DailyChallengeCard, { markDailyComplete } from "../components/math-game/DailyChallenge";
import Leaderboard from "../components/math-game/Leaderboard";
import DuelPanel from "../components/math-game/DuelPanel";
import DuelPlay from "../components/math-game/DuelPlay";
import ChallengePlay from "../components/math-game/ChallengePlay";
import FriendsPanel from "../components/math-game/FriendsPanel";
import ProfileCustomizer, { getTheme, AVATARS } from "../components/math-game/ProfileCustomizer";
import { Sparkles, Award, Trophy, Swords, Users, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const DEFAULT_PROGRESS = {
    current_level: 1,
    total_stars: 0,
    problems_solved: 0,
    current_streak: 0,
    best_streak: 0,
    badges: [],
    levels_completed: [],
    level_stars: {},
};

export default function MathGame() {
    const [progress, setProgress] = useState(null);
    const [progressId, setProgressId] = useState(null);
    const [screen, setScreen] = useState("map"); // map, play, complete, daily, duel, challenge
    const [activeLevel, setActiveLevel] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [newBadges, setNewBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isDaily, setIsDaily] = useState(false);
    const [activeDuel, setActiveDuel] = useState(null);
    const [duelRole, setDuelRole] = useState(null);
    const [duelResult, setDuelResult] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [challengeRole, setChallengeRole] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [records, user] = await Promise.all([
                base44.entities.PlayerProgress.list(),
                base44.auth.me().catch(() => null),
            ]);
            setCurrentUser(user);
            if (records.length > 0) {
                setProgress(records[0]);
                setProgressId(records[0].id);
            } else {
                const created = await base44.entities.PlayerProgress.create(DEFAULT_PROGRESS);
                setProgress({ ...DEFAULT_PROGRESS, id: created.id });
                setProgressId(created.id);
            }
            setLoading(false);
        } catch (err) {
            console.error("loadAll error:", err);
            setLoadError(err.message || String(err));
            setLoading(false);
        }
    };

    const saveProgress = async (updated) => {
        setProgress(updated);
        if (progressId) {
            const { id, created_date, updated_date, created_by, ...data } = updated;
            await base44.entities.PlayerProgress.update(progressId, data);
        }
        // Sync leaderboard
        if (currentUser) {
            const entries = await base44.entities.LeaderboardEntry.filter({ player_email: currentUser.email });
            const lbData = {
                player_name: currentUser.full_name || currentUser.email,
                player_email: currentUser.email,
                total_stars: updated.total_stars || 0,
                problems_solved: updated.problems_solved || 0,
                best_streak: updated.best_streak || 0,
                levels_completed: (updated.levels_completed || []).length,
            };
            if (entries.length > 0) {
                await base44.entities.LeaderboardEntry.update(entries[0].id, lbData);
            } else {
                await base44.entities.LeaderboardEntry.create(lbData);
            }
        }
    };

    const startLevel = (levelNum) => {
        setActiveLevel(levelNum);
        setIsDaily(false);
        setScreen("play");
    };

    const startDaily = () => {
        setActiveLevel(progress?.current_level || 1);
        setIsDaily(true);
        setScreen("play");
    };

    const handleLevelComplete = async (result) => {
        const { correct, total, stars, streak, failed } = result;
        const updated = { ...progress };

        updated.problems_solved = (updated.problems_solved || 0) + correct;
        updated.current_streak = streak;
        if (streak > (updated.best_streak || 0)) updated.best_streak = streak;

        if (isDaily && !failed) {
            const newStreak = await markDailyComplete(correct);
            // grant daily badge
            if (!updated.badges?.includes("daily_done")) {
                updated.badges = [...(updated.badges || []), "daily_done"];
            }
        }

        if (!failed && !isDaily) {
            const prevStars = (updated.level_stars || {})[String(activeLevel)] || 0;
            if (stars > prevStars) {
                updated.total_stars = (updated.total_stars || 0) + (stars - prevStars);
                updated.level_stars = { ...(updated.level_stars || {}), [String(activeLevel)]: stars };
            }
            if (!(updated.levels_completed || []).includes(activeLevel)) {
                updated.levels_completed = [...(updated.levels_completed || []), activeLevel];
            }
            if (activeLevel >= (updated.current_level || 1)) {
                updated.current_level = Math.min(activeLevel + 1, 10);
            }
        } else if (!failed && isDaily) {
            // daily: just count problems
            updated.total_stars = (updated.total_stars || 0) + Math.floor(correct / 4);
        }

        const earned = [];
        BADGES.forEach((badge) => {
            if (!(updated.badges || []).includes(badge.id) && badge.check(updated)) {
                earned.push(badge);
            }
        });
        if (earned.length > 0) {
            updated.badges = [...(updated.badges || []), ...earned.map((b) => b.id)];
        }

        setNewBadges(earned);
        setGameResult(result);
        setScreen("complete");
        await saveProgress(updated);
    };

    const handleDuelStart = (duel, role) => {
        setActiveDuel(duel);
        setDuelRole(role);
        setScreen("duel");
    };

    const handleDuelComplete = (result) => {
        setDuelResult(result);
        setScreen("duel_result");
    };

    const handleChallengeStart = (challenge, role) => {
        setActiveChallenge(challenge);
        setChallengeRole(role);
        setScreen("challenge");
    };

    const handleChallengeComplete = () => {
        setScreen("map");
    };

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative z-10 text-slate-800">
                <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full text-center">
                    <h2 className="text-xl font-bold text-rose-600 mb-2">Error Loading Game</h2>
                    <p className="text-slate-600 text-sm mb-4">{loadError}</p>
                    <button onClick={() => window.location.reload()} className="bg-rose-500 text-white rounded-xl px-4 py-2 font-bold hover:bg-rose-600">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative z-10 text-slate-800">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading your adventure...</p>
                </div>
            </div>
        );
    }

    const isDarkMode = progress?.dark_mode || false;

    if (screen === "play" && activeLevel) {
        return (
            <GamePlay
                levelNum={activeLevel}
                isDaily={isDaily}
                isDarkMode={isDarkMode}
                onComplete={handleLevelComplete}
                onExit={() => setScreen("map")}
            />
        );
    }

    if (screen === "challenge" && activeChallenge) {
        return (
            <ChallengePlay
                challenge={activeChallenge}
                role={challengeRole}
                isDarkMode={isDarkMode}
                onComplete={handleChallengeComplete}
                onExit={() => setScreen("map")}
            />
        );
    }

    if (screen === "duel" && activeDuel) {
        return (
            <DuelPlay
                duel={activeDuel}
                role={duelRole}
                isDarkMode={isDarkMode}
                onComplete={handleDuelComplete}
                onExit={() => setScreen("map")}
            />
        );
    }

    if (screen === "duel_result" && duelResult) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative z-10 text-slate-800">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center"
                >
                    <div className="text-5xl mb-4">{duelResult.score >= (duelResult.total / 2) ? "🏆" : "💪"}</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {duelResult.winner ? `Winner: ${duelResult.winner}` : "Duel Finished!"}
                    </h2>
                    <p className="text-slate-500 mb-6">Your score: {duelResult.score} / {duelResult.total}</p>
                    <button
                        onClick={() => setScreen("map")}
                        className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Back to Map
                    </button>
                </motion.div>
            </div>
        );
    }

    if (screen === "complete" && gameResult) {
        return (
            <LevelComplete
                levelNum={activeLevel}
                result={gameResult}
                newBadges={newBadges}
                isDarkMode={isDarkMode}
                onNextLevel={() => {
                    setActiveLevel(activeLevel + 1);
                    setIsDaily(false);
                    setScreen("play");
                }}
                onRetry={() => setScreen("play")}
                onHome={() => setScreen("map")}
            />
        );
    }

    const theme = getTheme(progress?.theme_color);
    const avatarVal = progress?.avatar || AVATARS[0];
    const isAvatarUrl = avatarVal?.startsWith("http");

    return (
        <div className={`min-h-screen relative ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
            <div className="max-w-lg mx-auto p-5 pb-16 relative z-10">
                {/* Header */}
                <div className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${theme.from} ${theme.to} text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg`}>
                            <Sparkles className="w-4 h-4" /> Math Quest
                        </div>
                        {/* Avatar + edit */}
                        <button onClick={() => setShowProfile(true)}
                            className="relative group flex items-center gap-2">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} flex items-center justify-center text-2xl overflow-hidden shadow-md border-2 border-white group-hover:scale-105 transition-transform`}>
                                {isAvatarUrl
                                    ? <img src={avatarVal} alt="avatar" className="w-full h-full object-cover" />
                                    : avatarVal}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                <Pencil className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                        </button>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-md pb-4 pt-3 px-6 rounded-3xl inline-block mt-2 shadow-xl border border-white/10">
                        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Math Adventure</h1>
                        <p className="text-white/90 font-medium mt-1 text-sm">Solve problems, earn stars, unlock badges!</p>
                    </div>
                </div>

                {/* Stats */}
                <StatsBar progress={progress} />

                {/* Daily Challenge */}
                <div className="mt-5">
                    <DailyChallengeCard onStartDaily={startDaily} />
                </div>

                {/* Profile customizer */}
                {showProfile && (
                    <ProfileCustomizer
                        progress={progress}
                        progressId={progressId}
                        onSave={(updated) => setProgress(updated)}
                        onClose={() => setShowProfile(false)}
                    />
                )}

                {/* Tabs */}
                <Tabs defaultValue="levels" className="mt-6">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-100 rounded-xl p-1 h-11">
                        <TabsTrigger value="levels" className={`rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:${theme.text}`}>
                            <Sparkles className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Levels</span>
                        </TabsTrigger>
                        <TabsTrigger value="badges" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Award className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Badges</span>
                        </TabsTrigger>
                        <TabsTrigger value="duels" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Swords className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Duels</span>
                        </TabsTrigger>
                        <TabsTrigger value="friends" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Users className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Friends</span>
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Trophy className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Top</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="levels" className="mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            {LEVELS.map((level) => {
                                const isUnlocked = level.level <= (progress?.current_level || 1);
                                const isCompleted = (progress?.levels_completed || []).includes(level.level);
                                const starsEarned = (progress?.level_stars || {})[String(level.level)] || 0;
                                return (
                                    <LevelCard
                                        key={level.level}
                                        level={level}
                                        isUnlocked={isUnlocked}
                                        isCompleted={isCompleted}
                                        starsEarned={starsEarned}
                                        onClick={startLevel}
                                    />
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="badges" className="mt-6">
                        <BadgesPanel earnedBadges={progress?.badges || []} />
                    </TabsContent>

                    <TabsContent value="duels" className="mt-6">
                        <DuelPanel currentUser={currentUser} onStartDuel={handleDuelStart} />
                    </TabsContent>

                    <TabsContent value="friends" className="mt-6">
                        <FriendsPanel currentUser={currentUser} onStartDuel={handleDuelStart} onStartChallenge={handleChallengeStart} />
                    </TabsContent>

                    <TabsContent value="leaderboard" className="mt-6">
                        <Leaderboard />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}