import { base44Client } from '@/api/base44Client';

export class LeaderboardEntry {
    static async getGlobal() {
        return await base44Client.getLeaderboard();
    }
}
