import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus, Users, Check, X, Star, Send, MessageCircle, Swords, Clock,
    Plus, Trophy, Bell, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const QUICK_PHRASES = [
    "You're amazing! 🌟", "Keep it up! 💪", "You're on fire! 🔥",
    "Math wizard! 🧙", "Unstoppable! 🚀", "So proud of you! 🎉",
    "Beat my score if you can! 😄", "Let's duel soon! ⚔️",
];

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];
const MEDAL_BG = ["bg-amber-50 border-amber-200", "bg-slate-50 border-slate-200", "bg-orange-50 border-orange-200"];

function Avatar({ name, size = "sm" }) {
    const sz = size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
    return (
        <div className={cn("rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black flex-shrink-0", sz)}>
            {name?.[0]?.toUpperCase() || "?"}
        </div>
    );
}

function MessageDrawer({ friend, myEmail, myName, onClose }) {
    const [messages, setMessages] = useState([]);
    const [customMsg, setCustomMsg] = useState("");
    const [sent, setSent] = useState(false);

    useEffect(() => {
        base44.entities.Encouragement.filter({ to_email: myEmail }).then(received => {
            setMessages(received.filter(e => e.from_email === friend.player_email).slice(-5).reverse());
        });
    }, [friend.player_email, myEmail]);

    const sendMsg = async (msg) => {
        await base44.entities.Encouragement.create({ from_name: myName, from_email: myEmail, to_email: friend.player_email, message: msg });
        setSent(true);
        setTimeout(() => setSent(false), 2000);
        setCustomMsg("");
    };

    return (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mx-1 mb-2 bg-slate-50 border-2 border-slate-200 rounded-b-2xl p-4 space-y-3">
                {messages.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From {friend.player_name}</p>
                        {messages.map(m => (
                            <p key={m.id} className="text-xs bg-indigo-50 text-indigo-800 rounded-xl px-3 py-1.5">{m.message}</p>
                        ))}
                    </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_PHRASES.map(phrase => (
                        <button key={phrase} onClick={() => sendMsg(phrase)}
                            className="text-xs bg-white border border-slate-200 hover:border-pink-400 hover:bg-pink-50 rounded-xl px-2.5 py-1 transition-all text-slate-700">
                            {phrase}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input value={customMsg} onChange={e => setCustomMsg(e.target.value)} placeholder="Custom message..."
                        className="rounded-xl text-xs h-8" onKeyDown={e => e.key === "Enter" && customMsg.trim() && sendMsg(customMsg.trim())} />
                    <Button size="sm" onClick={() => customMsg.trim() && sendMsg(customMsg.trim())} disabled={!customMsg.trim()}
                        className={cn("rounded-xl h-8 px-3", sent ? "bg-emerald-500" : "bg-pink-500 hover:bg-pink-600")}>
                        {sent ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                    </Button>
                </div>
                <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>
        </motion.div>
    );
}

function CreateChallengeModal({ friends, myEmail, myName, onClose, onCreated }) {
    const [toEmail, setToEmail] = useState(friends[0]?.player_email || "");
    const [ops, setOps] = useState(["+", "-"]);
    const [minNum, setMinNum] = useState(1);
    const [maxNum, setMaxNum] = useState(10);
    const [numProblems, setNumProblems] = useState(5);
    const [sending, setSending] = useState(false);

    const toggleOp = (op) => setOps(prev => prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]);

    const create = async () => {
        if (!toEmail || ops.length === 0) return;
        setSending(true);
        const toFriend = friends.find(f => f.player_email === toEmail);
        await base44.entities.FriendChallenge.create({
            from_email: myEmail,
            from_name: myName,
            to_email: toEmail,
            to_name: toFriend?.player_name || "",
            operations: ops.join(""),
            min_num: minNum,
            max_num: maxNum,
            num_problems: numProblems,
            status: "pending",
            challenger_score: 0,
            opponent_score: 0,
        });
        setSending(false);
        onCreated();
        onClose();
    };

    const opBtns = ["+", "-", "×"];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                <h3 className="font-black text-slate-800 text-lg mb-4">Create Custom Challenge</h3>

                {/* To friend */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Challenge</label>
                    <select value={toEmail} onChange={e => setToEmail(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400">
                        {friends.map(f => <option key={f.player_email} value={f.player_email}>{f.player_name}</option>)}
                    </select>
                </div>

                {/* Operations */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Operations</label>
                    <div className="flex gap-2">
                        {opBtns.map(op => (
                            <button key={op} onClick={() => toggleOp(op)}
                                className={cn("flex-1 py-2 rounded-xl font-black text-lg border-2 transition-all",
                                    ops.includes(op) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600")}>
                                {op}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Number range */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Min</label>
                        <input type="number" min={0} max={maxNum - 1} value={minNum} onChange={e => setMinNum(Number(e.target.value))}
                            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Max</label>
                        <input type="number" min={minNum + 1} max={100} value={maxNum} onChange={e => setMaxNum(Number(e.target.value))}
                            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400" />
                    </div>
                </div>

                {/* Number of problems */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Problems: {numProblems}</label>
                    <input type="range" min={3} max={15} value={numProblems} onChange={e => setNumProblems(Number(e.target.value))}
                        className="w-full accent-indigo-600" />
                </div>

                <div className="flex gap-2">
                    <Button onClick={create} disabled={sending || ops.length === 0}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
                        {sending ? "Sending..." : <><Swords className="w-4 h-4 mr-1.5" /> Send Challenge</>}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function FriendsPanel({ currentUser, onStartChallenge, onStartDuel }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [pending, setPending] = useState([]);
    const [encouragements, setEncouragements] = useState([]);
    const [recentOpponents, setRecentOpponents] = useState([]);
    const [incomingChallenges, setIncomingChallenges] = useState([]);
    const [challengeHistory, setChallengeHistory] = useState([]);
    const [addEmail, setAddEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [activeTab, setActiveTab] = useState("leaderboard"); // leaderboard | challenges | requests

    const myEmail = currentUser?.email || "";
    const myName = currentUser?.full_name || "You";

    useEffect(() => {
        if (!myEmail) { setLoading(false); return; }
        loadAll();
    }, [myEmail]);

    const loadAll = async () => {
        const [sent, received, lb, cheers, duels, challengesSent, challengesReceived] = await Promise.all([
            base44.entities.Friendship.filter({ from_email: myEmail }),
            base44.entities.Friendship.filter({ to_email: myEmail }),
            base44.entities.LeaderboardEntry.list("-total_stars", 50),
            base44.entities.Encouragement.filter({ to_email: myEmail }),
            base44.entities.Duel.list("-created_date", 30),
            base44.entities.FriendChallenge.filter({ from_email: myEmail }),
            base44.entities.FriendChallenge.filter({ to_email: myEmail }),
        ]);

        const acceptedEmails = new Set([
            ...sent.filter(f => f.status === "accepted").map(f => f.to_email),
            ...received.filter(f => f.status === "accepted").map(f => f.from_email),
        ]);

        const allFriendEmails = Array.from(acceptedEmails);
        const friendEntries = lb.filter(e => allFriendEmails.includes(e.player_email));
        const myEntry = lb.find(e => e.player_email === myEmail);
        const friendLb = [myEntry, ...friendEntries].filter(Boolean).sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0));

        // Recently played with
        const seenEmails = new Set([myEmail]);
        const recent = [];
        for (const duel of duels) {
            if (duel.status !== "completed") continue;
            const isChallenger = duel.challenger_email === myEmail;
            const isOpponent = duel.opponent_email === myEmail;
            if (!isChallenger && !isOpponent) continue;
            const oppEmail = isChallenger ? duel.opponent_email : duel.challenger_email;
            const oppName = isChallenger ? duel.opponent_name : duel.challenger_name;
            if (oppEmail && !seenEmails.has(oppEmail)) {
                seenEmails.add(oppEmail);
                recent.push({ email: oppEmail, name: oppName, level: duel.level });
            }
            if (recent.length >= 4) break;
        }

        // Incoming pending challenges
        const incoming = challengesReceived.filter(c => c.status === "pending");
        // History: accepted or completed for both parties
        const allChallenges = [...challengesSent, ...challengesReceived.filter(c => c.status !== "pending")];
        const uniq = Array.from(new Map(allChallenges.map(c => [c.id, c])).values())
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 10);

        setPending(received.filter(f => f.status === "pending"));
        setLeaderboard(friendLb);
        setEncouragements(cheers.slice(-3).reverse());
        setRecentOpponents(recent);
        setIncomingChallenges(incoming);
        setChallengeHistory(uniq);
        setLoading(false);
    };

    const sendFriendRequest = async () => {
        const email = addEmail.trim();
        if (!email || email === myEmail) return;
        await base44.entities.Friendship.create({ from_email: myEmail, from_name: myName, to_email: email, status: "pending" });
        setAddEmail("");
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2500);
    };

    const acceptFriend = async (friendship) => {
        await base44.entities.Friendship.update(friendship.id, { status: "accepted", to_name: myName });
        setPending(p => p.filter(f => f.id !== friendship.id));
        loadAll();
    };

    const rejectFriend = async (friendship) => {
        await base44.entities.Friendship.delete(friendship.id);
        setPending(p => p.filter(f => f.id !== friendship.id));
    };

    const acceptChallenge = (challenge) => {
        onStartChallenge(challenge, "opponent");
    };

    const friendsForChallenge = leaderboard.filter(e => e.player_email !== myEmail);
    const notifCount = pending.length + incomingChallenges.length;

    if (!myEmail) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Sign in to use friends features</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Inbox */}
            {encouragements.length > 0 && (
                <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">💌 Messages from friends</p>
                    {encouragements.map(e => (
                        <p key={e.id} className="text-sm text-slate-700">
                            <span className="font-bold text-pink-600">{e.from_name || e.from_email}</span>: {e.message}
                        </p>
                    ))}
                </div>
            )}

            {/* Add friend */}
            <div>
                <p className="font-bold text-slate-700 mb-2 text-sm">Add a Friend</p>
                <div className="flex gap-2">
                    <Input value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="Friend's email"
                        className="rounded-xl text-sm" onKeyDown={e => e.key === "Enter" && sendFriendRequest()} />
                    <Button onClick={sendFriendRequest} size="sm"
                        className={cn("rounded-xl flex-shrink-0", addSuccess ? "bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-700")}>
                        {addSuccess ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </Button>
                </div>
                {addSuccess && <p className="text-xs text-emerald-600 mt-1 font-medium">Friend request sent!</p>}
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1.5">
                {[
                    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
                    { key: "challenges", label: `Challenges${notifCount > 0 ? ` (${notifCount})` : ""}`, icon: Swords },
                    { key: "history", label: "History", icon: History },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={cn("flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                            activeTab === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300")}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                ))}
            </div>

            {/* Leaderboard tab */}
            {activeTab === "leaderboard" && (
                <div className="space-y-2">
                    {/* Friend requests */}
                    {pending.length > 0 && (
                        <div className="mb-3">
                            <p className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-1"><Bell className="w-4 h-4 text-amber-500" /> Friend Requests ({pending.length})</p>
                            {pending.map(req => (
                                <div key={req.id} className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 mb-2">
                                    <Avatar name={req.from_name || req.from_email} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{req.from_name || req.from_email}</p>
                                        <p className="text-xs text-slate-400 truncate">{req.from_email}</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => acceptFriend(req)} className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => rejectFriend(req)} className="w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center text-rose-600 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recently played */}
                    {recentOpponents.length > 0 && (
                        <div className="mb-3">
                            <p className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Recently Played With</p>
                            <div className="space-y-2">
                                {recentOpponents.map(opp => (
                                    <div key={opp.email} className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl p-3">
                                        <Avatar name={opp.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{opp.name}</p>
                                            <p className="text-xs text-slate-400">Level {opp.level} duel</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends leaderboard */}
                    <p className="font-bold text-slate-700 text-sm flex items-center gap-1.5 mb-2">
                        <Star className="w-4 h-4 text-amber-500" /> Friends Leaderboard
                    </p>
                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
                    ) : leaderboard.length <= 1 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">Add friends to see them here!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {leaderboard.map((entry, idx) => {
                                const isMe = entry.player_email === myEmail;
                                const isOpen = openDrawer === entry.player_email;
                                return (
                                    <div key={entry.id || entry.player_email}>
                                        <div onClick={() => !isMe && setOpenDrawer(isOpen ? null : entry.player_email)}
                                            className={cn("flex items-center gap-3 rounded-2xl p-3 border-2 transition-all",
                                                isMe ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200 cursor-pointer",
                                                idx < 3 && !isMe ? MEDAL_BG[idx] : "")}>
                                            <div className="w-6 text-center">
                                                {idx < 3 ? <span className="text-base">{["🥇", "🥈", "🥉"][idx]}</span>
                                                    : <span className="text-sm font-black text-slate-400">{idx + 1}</span>}
                                            </div>
                                            <Avatar name={entry.player_name} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">
                                                    {entry.player_name} {isMe && <span className="text-xs text-indigo-500 font-medium">(you)</span>}
                                                </p>
                                                <p className="text-xs text-slate-400">{entry.levels_completed || 0} levels · {entry.problems_solved || 0} solved</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="font-black text-slate-800 text-sm">{entry.total_stars || 0} ⭐</span>
                                                {!isMe && <MessageCircle className="w-4 h-4 text-pink-400" />}
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {isOpen && !isMe && (
                                                <MessageDrawer friend={entry} myEmail={myEmail} myName={myName} onClose={() => setOpenDrawer(null)} />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Challenges tab */}
            {activeTab === "challenges" && (
                <div className="space-y-4">
                    {/* Create challenge */}
                    {friendsForChallenge.length > 0 && (
                        <Button onClick={() => setShowCreateChallenge(true)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold h-11">
                            <Plus className="w-4 h-4 mr-2" /> Create Custom Challenge
                        </Button>
                    )}

                    {/* Incoming challenges */}
                    {incomingChallenges.length > 0 && (
                        <div>
                            <p className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-1.5">
                                <Bell className="w-4 h-4 text-amber-500" /> Incoming Challenges
                            </p>
                            <div className="space-y-2">
                                {incomingChallenges.map(c => (
                                    <div key={c.id} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{c.from_name || c.from_email} challenged you!</p>
                                                <p className="text-xs text-slate-500">
                                                    {c.operations} · {c.min_num}–{c.max_num} · {c.num_problems} problems
                                                </p>
                                            </div>
                                            <Button size="sm" onClick={() => acceptChallenge(c)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                                                <Swords className="w-3.5 h-3.5 mr-1" /> Accept
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {incomingChallenges.length === 0 && friendsForChallenge.length === 0 && (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">Add friends to send challenges!</p>
                        </div>
                    )}

                    {incomingChallenges.length === 0 && friendsForChallenge.length > 0 && (
                        <div className="text-center py-6 text-slate-400">
                            <p className="text-sm">No incoming challenges. Send one!</p>
                        </div>
                    )}
                </div>
            )}

            {/* History tab */}
            {activeTab === "history" && (
                <div>
                    <p className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-1.5">
                        <History className="w-4 h-4 text-slate-400" /> Challenge History
                    </p>
                    {challengeHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">No challenge history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {challengeHistory.map(c => {
                                const isChallenger = c.from_email === myEmail;
                                const myScore = isChallenger ? c.challenger_score : c.opponent_score;
                                const oppScore = isChallenger ? c.opponent_score : c.challenger_score;
                                const oppName = isChallenger ? (c.to_name || c.to_email) : (c.from_name || c.from_email);
                                const won = c.winner_name === myName;
                                return (
                                    <div key={c.id} className={cn("rounded-2xl p-4 border-2", c.status === "completed"
                                        ? (won ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")
                                        : "bg-slate-50 border-slate-200")}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">vs {oppName}</p>
                                                <p className="text-xs text-slate-500">{c.operations} · {c.min_num}–{c.max_num} · {c.num_problems} problems</p>
                                            </div>
                                            <div className="text-right">
                                                {c.status === "completed" ? (
                                                    <>
                                                        <p className="text-sm font-black text-slate-800">{myScore} – {oppScore}</p>
                                                        <p className={cn("text-xs font-bold", won ? "text-emerald-600" : "text-rose-600")}>
                                                            {won ? "You won! 🏆" : "They won"}
                                                        </p>
                                                    </>
                                                ) : c.status === "accepted" ? (
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-100 rounded-lg px-2 py-1">Waiting</span>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-lg px-2 py-1">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Create challenge modal */}
            <AnimatePresence>
                {showCreateChallenge && (
                    <CreateChallengeModal
                        friends={friendsForChallenge}
                        myEmail={myEmail}
                        myName={myName}
                        onClose={() => setShowCreateChallenge(false)}
                        onCreated={loadAll}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}