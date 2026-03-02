import { base44Client } from '@/api/base44Client';

export class Friendship {
    static async getFriendsList() {
        return await base44Client.getFriends();
    }
}
