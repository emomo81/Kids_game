export class DailyChallenge {
    constructor() {
        this.storageKey = 'math_game_daily_challenge';
        this.data = this.load();
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        const today = new Date().toISOString().split('T')[0];

        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === today) return parsed;
            // If it's a new day, keep the old streak but reset daily completion
            return {
                date: today,
                completed: false,
                score: 0,
                streak: parsed.completed ? parsed.streak : 0,
                targetScore: 50
            };
        }

        return {
            date: today,
            completed: false,
            score: 0,
            streak: 0,
            targetScore: 50
        };
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    addScore(scoreEarned) {
        if (this.data.completed) return false;

        this.data.score += scoreEarned;
        if (this.data.score >= this.data.targetScore) {
            this.data.completed = true;
            this.data.streak += 1;
            this.save();
            return true; // Just completed
        }
        this.save();
        return false;
    }
}

export const dailyChallenge = new DailyChallenge();
