class PlayerProgress {
    constructor() {
        this.storageKey = 'math_game_progress';
        this.data = this.load();
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {
            level: 1,
            stars: 0,
            totalSolved: 0,
            streak: 0,
            badges: [],
            avatar: '🦊',
            themeColor: 'indigo'
        };
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    updateProgress(starsEarned, isLevelComplete) {
        this.data.stars += starsEarned;
        this.data.totalSolved += 1;
        this.data.streak += 1;
        if (isLevelComplete) {
            this.data.level = Math.min(10, this.data.level + 1);
        }
        this.checkBadges();
        this.save();
    }

    breakStreak() {
        this.data.streak = 0;
        this.save();
    }

    checkBadges() {
        // Logic for awarding badges
        if (this.data.stars >= 10 && !this.data.badges.includes('Star Novice')) {
            this.data.badges.push('Star Novice');
        }
        if (this.data.streak >= 5 && !this.data.badges.includes('On Fire')) {
            this.data.badges.push('On Fire');
        }
        if (this.data.level >= 5 && !this.data.badges.includes('Halfway There')) {
            this.data.badges.push('Halfway There');
        }
        if (this.data.level === 10 && !this.data.badges.includes('Math Master')) {
            this.data.badges.push('Math Master');
        }
    }

    updateProfile(updates) {
        if (updates.avatar) this.data.avatar = updates.avatar;
        if (updates.themeColor) this.data.themeColor = updates.themeColor;
        this.save();
    }
}

export const playerProgress = new PlayerProgress();
