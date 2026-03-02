import { base44Client } from '@/api/base44Client';

export class Encouragement {
    static async send(friendId, phrase) {
        return await base44Client.sendEncouragement(friendId, phrase);
    }
}
