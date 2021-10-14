import { Message } from 'discord.js';

import Logger from '../../classes/Logger';
import Command from '../../structures/Command';
import DiscordClient from '../../structures/DiscordClient';

export default class ReloadCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'reload',
            group: 'Developer',
            description: 'Reboots the bot.',
            require: {
                developer: true
            }
        });
    }

    async run(message: Message, args: string[]) {
        Logger.log('WARNING', `Bot rebooting... (Requested by ${message.author.tag})`, true);
        
        this.client.destroy();

        this.client.registry.reregisterAll();

        this.client.login(this.client.config.token).then(async () => {

            this.client.emit('ready');

            await message.channel.send({
                embeds: [
                    {
                        color: 'GREEN',
                        title: 'Reloaded',
                        description: `รีระบบสำเร็จ`,
                        footer: {text: `Version : ทดลอง`},
                        timestamp: new Date()
                    }
                ]
            });
        });
    }
}
