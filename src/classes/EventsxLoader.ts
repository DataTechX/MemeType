import dotenv from 'dotenv';

import EvenxError from '../errors/EvenxError';

export default class EnvLoader {
    
     // โหลดและตรวจสอบไฟล์ .env
     
    static load() {
        dotenv.config();
        this.validate(process.env);
    }

    /**
     * ตรวจสอบไฟล์ .env
     * @param env Env object
     */
    private static validate(env: any) {
        if (env.TOKEN === '') throw new EvenxError('Discord token missing.');
        if (env.PREFIX === '') throw new EvenxError('Prefix missing.');
        if (env.DEVELOPERS === '') throw new EvenxError('Developers missing.');
        if (!env.DEVELOPERS.startsWith('[') || !env.DEVELOPERS.endsWith(']')) throw new EvenxError('Developers must be an array.');

        try {
            JSON.parse(env.DEVELOPERS);
        } catch (_) {
            throw new EvenxError('Developers must be an array.');
        }

        if (env.UNKNOWN_COMMAND_ERROR === '') throw new EvenxError('Unknown command error missing');
        if (!['true', 'false'].includes(env.UNKNOWN_COMMAND_ERROR)) throw new EvenxError('Unknown command error must be typeof boolean.');
    }
}
