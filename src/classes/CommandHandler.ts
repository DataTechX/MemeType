import { Guild, GuildMember, Message, TextChannel } from 'discord.js';

import DiscordClient from '../structures/DiscordClient';
import { formatSeconds, isUserDeveloper } from '../utils/functions';

export default class CommandHandler {
    /**
     * จัดการคำสั่ง
     * @param message Message object
     */
    static async handleCommand(client: DiscordClient, message: Message) {
        const self = (message.guild as Guild).me as GuildMember;
        if (!self.permissions.has('SEND_MESSAGES') || !(message.channel as TextChannel).permissionsFor(self)?.has('SEND_MESSAGES')) return;
        if (!self.permissions.has('ADMINISTRATOR'))
            return await message.channel.send({
                embeds: [
                    {
                        color: '#FF0808',
                        title: '🚨 ไม่มีสิทธิ์เพียงพอ',
                        description: `${message.author}, บอทต้องการ \`ADMINISTRATOR\` เพื่อให้สามารถใช้งานได้`
                    }
                ]
            });

        const prefix = client.config.prefix;
        if (message.content.toLocaleLowerCase().indexOf(prefix) !== 0) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = (args.shift() as string).toLowerCase();

        const cmd = client.registry.findCommand(command);
        if (!cmd) {
            if (client.config.unknownErrorMessage)
                await message.channel.send({
                    embeds: [
                        {
                            color: '#FF0808',
                            title: '🔎 คำสั่งที่ไม่รู้จัก',
                            description: `${message.author}, ลอง \`${client.config.prefix}help\` เพื่อดูรายการคำสั่ง.`
                        }
                    ]
                });
            return;
        }

        if (cmd.info.enabled === false) return;
        if (cmd.info.onlyNsfw === true && !(message.channel as TextChannel).nsfw && !isUserDeveloper(client, message.author.id))
            return await message.channel.send({
                embeds: [
                    {
                        color: '#FF0000',
                        title: '🔞 เฮ้',
                        description: `${message.author}, ไม่สามารถใช้คำสั่งนี้กับช่องที่ไม่ใช่ nsfw`
                    }
                ]
            });

        if (cmd.info.require) {
            if (cmd.info.require.developer && !isUserDeveloper(client, message.author.id)) return;
            if (cmd.info.require.permissions && !isUserDeveloper(client, message.author.id)) {
                const perms: string[] = [];
                cmd.info.require.permissions.forEach(permission => {
                    if ((message.member as GuildMember).permissions.has(permission)) return;
                    else return perms.push(`\`${permission}\``);
                });
                if (perms.length)
                    return await message.channel.send({
                        embeds: [
                            {
                                color: '#FF0000',
                                title: '⚠️ ไม่มีสิทธิ์เพียงพอ',
                                description: `${message.author}, คุณต้องมีสิทธิ์เหล่านี้เพื่อเรียกใช้คำสั่งนี้\n\n${perms.join('\n')}`
                            }
                        ]
                    });
            }
        }

        var addCooldown = false;

        const now = Date.now();
        const timestamps = client.registry.getCooldownTimestamps(cmd.info.name);
        const cooldownAmount = cmd.info.cooldown ? cmd.info.cooldown * 1000 : 0;
        if (cmd.info.cooldown) {
            if (timestamps.has(message.author.id)) {
                const currentTime = timestamps.get(message.author.id);
                if (!currentTime) return;

                const expirationTime = currentTime + cooldownAmount;
                if (now < expirationTime) {
                    await message.delete();
                    const timeLeft = (expirationTime - now) / 1000;
                    return await message.channel
                        .send({
                            embeds: [
                                {
                                    color: 'ORANGE',
                                    title: '⏰ คูลดาวน์',
                                    description: `${message.author}, โปรดรอจนกว่า \`${formatSeconds(Math.floor(timeLeft))}\` เพื่อใช้คำสั่งนี้อีกรอบ`
                                }
                            ]
                        })
                        .then(msg => setTimeout(async () => await msg.delete().catch(() => {}), 3000));
                }
            }

            addCooldown = true;
        }

        try {
            var applyCooldown = true;

            await cmd.run(message, args, () => {
                applyCooldown = false;
            });

            if (addCooldown && applyCooldown && !isUserDeveloper(client, message.author.id)) {
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
        } catch (error) {
            await cmd.onError(message, error);
        }
    }
}
