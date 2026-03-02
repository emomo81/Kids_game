import { base44Client } from '@/api/base44Client';

export class Duel {
    static async findMatch() {
        return await base44Client.findRandomDuel();
    }

    static submitScore(score) {
        console.log("Submitted duel score:", score);
    }
}
