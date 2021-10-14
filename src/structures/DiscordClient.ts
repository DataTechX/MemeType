import { Client, IntentsString } from 'discord.js';

import Registry from '../classes/Registry';
import { IConfig } from '../utils/interfaces';

export default class DiscordClient extends Client {

    //* การลงทะเบียนของบอท

    readonly registry: Registry;


    // การกำหนดค่าของบอท

    readonly config: IConfig;

    constructor(intents: IntentsString[]) {
        super({ intents });


        // ตั้งค่าคอนฟิกของบอท

        this.config = {
            token: process.env.TOKEN as string,
            prefix: process.env.PREFIX as string,
            developers: JSON.parse(process.env.DEVELOPERS as string) as string[],
            unknownErrorMessage: JSON.parse(process.env.UNKNOWN_COMMAND_ERROR as string)
        };


        // สร้างคลาสรีจิสตรีใหม่

        this.registry = new Registry(this);


        // อีเว้นท์และคำสั่ง

        this.registry.registerAll();
    }
}
