import { GuildMember, Message, TextChannel } from 'discord.js';

import Logger from '../classes/Logger';
import { isUserDeveloper } from '../utils/functions';
import { ICommandInfo } from '../utils/interfaces';
import DiscordClient from './DiscordClient';

export default abstract class Command {

    // DiscordClient....

    readonly client: DiscordClient;


    // ข้อมูลคำสั่ง.

    readonly info: ICommandInfo;

    constructor(client: DiscordClient, info: ICommandInfo) {
        this.client = client;
        this.info = info;
    }

    /**
     * ดำเนินการเมื่อคำสั่งแสดงข้อผิดพลาด
     * @param message Message object
     * @param error Error message
     */
    async onError(message: Message, error: any) {
        Logger.log('ERROR', `An error occurred in "${this.info.name}" command.\n${error}\n`, true);
        await message.channel.send({
            embeds: [
                {
                    color: 'RED',
                    title: '❓ เอ๋...',
                    description: `${message.author}, เกิดข้อผิดพลาดขณะรันคำสั่งนี้ โปรดลองอีกครั้งในภายหลัง.`
                }
            ]
        });
    }

    /**
     * ส่งคืนการใช้งานของคำสั่ง
     * @param message Message object
     * @param checkNsfw Checking nsfw channel
     */
    isUsable(message: Message, checkNsfw: boolean = false): boolean {
        if (this.info.enabled === false) return false;
        if (checkNsfw && this.info.onlyNsfw === true && !(message.channel as TextChannel).nsfw && !isUserDeveloper(this.client, message.author.id)) return false;
        if (this.info.require) {
            if (this.info.require.developer && !isUserDeveloper(this.client, message.author.id)) return false;
            if (this.info.require.permissions && !isUserDeveloper(this.client, message.author.id)) {
                const perms: string[] = [];
                this.info.require.permissions.forEach(permission => {
                    if ((message.member as GuildMember).permissions.has(permission)) return;
                    else return perms.push(permission);
                });
                if (perms.length) return false;
            }
        }

        return true;
    }

    /**
     * รันคำสั่ง
     * @param message Message object
     * @param args Arguments
     * @param cancelCooldown Cancels cooldown when function called
     */
    abstract run(message: Message, args: string[], cancelCooldown?: () => void): Promise<any>;
}
