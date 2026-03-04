import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AVATARS = ["🦁", "🐯", "🐻", "🦊", "🐺", "🐸", "🐧", "🦋", "🐉", "🦄", "🤖", "👾", "🧙", "🦸", "⭐", "🔥", "🚀", "🌈"];

export const THEMES = [
    { key: "indigo", label: "Indigo", from: "from-indigo-500", to: "to-violet-500", ring: "ring-indigo-400", bg: "bg-indigo-600", light: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-400" },
    { key: "rose", label: "Rose", from: "from-rose-500", to: "to-pink-500", ring: "ring-rose-400", bg: "bg-rose-600", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-400" },
    { key: "emerald", label: "Emerald", from: "from-emerald-500", to: "to-teal-500", ring: "ring-emerald-400", bg: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-400" },
    { key: "amber", label: "Amber", from: "from-amber-400", to: "to-orange-500", ring: "ring-amber-400", bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-400" },
    { key: "sky", label: "Sky", from: "from-sky-500", to: "to-cyan-500", ring: "ring-sky-400", bg: "bg-sky-600", light: "bg-sky-50", text: "text-sky-600", border: "border-sky-400" },
    { key: "purple", label: "Purple", from: "from-purple-500", to: "to-fuchsia-500", ring: "ring-purple-400", bg: "bg-purple-600", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-400" },
];

export function getTheme(key) {
    return THEMES.find(t => t.key === key) || THEMES[0];
}

export default function ProfileCustomizer({ progress, progressId, onSave, onClose }) {
    const [avatar, setAvatar] = useState(progress?.avatar || AVATARS[0]);
    const [themeKey, setThemeKey] = useState(progress?.theme_color || "indigo");
    const [isDarkMode, setIsDarkMode] = useState(progress?.dark_mode || false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { logout } = useAuth();
    const fileRef = useRef();

    const theme = getTheme(themeKey);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAvatar(file_url);
        setUploading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await base44.entities.PlayerProgress.update(progressId, { avatar, theme_color: themeKey, dark_mode: isDarkMode });
        onSave({ ...progress, avatar, theme_color: themeKey, dark_mode: isDarkMode });
        setSaving(false);
        onClose();
    };

    const isUrl = avatar?.startsWith("http");

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

                    {/* Header */}
                    <div className={cn("bg-gradient-to-r p-5 flex items-center justify-between", theme.from, theme.to)}>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl overflow-hidden">
                                {isUrl ? <img src={avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" /> : avatar}
                            </div>
                            <div>
                                <p className="font-black text-white text-lg leading-tight">Your Profile</p>
                                <p className="text-white/70 text-xs">Pick your style</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Avatar picker */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Choose Avatar</p>
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {AVATARS.map(a => (
                                    <button key={a} onClick={() => setAvatar(a)}
                                        className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all",
                                            avatar === a ? cn("border-2", theme.border, theme.light) : "border-transparent bg-slate-50 hover:bg-slate-100")}>
                                        {a}
                                    </button>
                                ))}
                            </div>

                            {/* Upload custom */}
                            <button onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl py-2.5 text-sm text-slate-500 font-medium transition-colors">
                                <Upload className="w-4 h-4" />
                                {uploading ? "Uploading..." : "Upload custom avatar"}
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                            {isUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                    <img src={avatar} alt="custom" className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-300" />
                                    <p className="text-xs text-slate-500">Custom avatar selected</p>
                                </div>
                            )}
                        </div>

                        {/* Theme picker */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color Theme</p>
                            <div className="grid grid-cols-3 gap-2">
                                {THEMES.map(t => (
                                    <button key={t.key} onClick={() => setThemeKey(t.key)}
                                        className={cn("relative h-12 rounded-xl bg-gradient-to-r transition-all border-2 overflow-hidden",
                                            t.from, t.to,
                                            themeKey === t.key ? "border-slate-800 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100")}>
                                        <span className="text-white text-xs font-bold">{t.label}</span>
                                        {themeKey === t.key && (
                                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-slate-800" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <div className="mt-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">App Theme</p>
                            <div
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-slate-700 text-yellow-400" : "bg-white text-orange-500 shadow-sm"}`}>
                                        {isDarkMode ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4 fill-current" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                            {isDarkMode ? "Dark Mode" : "Light Mode"}
                                        </p>
                                    </div>
                                </div>
                                {/* Switch */}
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isDarkMode ? theme.bg : "bg-slate-300"}`}>
                                    <motion.div
                                        layout
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: isDarkMode ? 24 : 0 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={() => logout(true)}
                                className="w-1/3 rounded-xl font-bold h-11 border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Exit
                            </Button>
                            <Button onClick={handleSave} disabled={saving}
                                className={cn("w-2/3 rounded-xl font-bold h-11 text-white bg-gradient-to-r shadow-md", theme.from, theme.to)}>
                                {saving ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}