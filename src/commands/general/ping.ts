import { Client, Message, MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import DiscordClient from '../../structures/DiscordClient';

export default class PingApi extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'ping',
            group: 'General',
            description: 'เช็ค delay api',
            cooldown: 30
        });
    }
    async run(message: Message, args: string[]) {
        const P = new MessageEmbed()
            .setDescription('**กำลังค้นหา API Latency**')
            .setColor('#ff6387')

        const G = new MessageEmbed()
        .setColor('#ff6387')
        .setDescription(`**API Latency is** \`\`${this.client.ws.ping}ms\`\` `)

        message.channel.send({embeds: [P]}).then((message) => {
            message.edit({embeds: [G]}).catch(err => console.log(err));
        })

        
    }
}