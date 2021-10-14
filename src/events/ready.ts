import Logger from '../classes/Logger';
import DiscordClient from '../structures/DiscordClient';
import Event from '../structures/Event';

export default class ReadyEvent extends Event {

    // ฟังชั่นสถานะบอท
    constructor(client: DiscordClient) {
        super(client, 'ready');
    }

    async run() {
        Logger.log('SUCCESS', `Logged in as "${this.client.user?.tag}".`);
    }
}
