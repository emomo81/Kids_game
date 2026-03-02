import { base44Client } from '@/api/base44Client';

export class FriendChallenge {
    static async sendChallenge(friendId, details) {
        return await base44Client.sendFriendChallenge(friendId, details);
    }

    static async getIncoming() {
        return await base44Client.getIncomingChallenges();
    }
}
