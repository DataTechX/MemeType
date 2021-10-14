import { Collection } from 'discord.js';
import path from 'path';
import requireAll from 'require-all';

import RegistryError from '../errors/RegistryError';
import Command from '../structures/Command';
import DiscordClient from '../structures/DiscordClient';
import Event from '../structures/Event';
import { isConstructor } from '../utils/functions';
import Logger from './Logger';

export default class Registry {

    // DiscordClient....

    private client: DiscordClient;


    // รวบรวมสำหรับคำสั่ง

    private commands: Collection<string, Command>;

    // เส้นทางคำสั่ง

    private commandPaths: string[] = [];


    // คอลเลกชันสำหรับอีเวนท์

    private events: Collection<string, Event>;


    // เส้นทางอีเวนท์ุ

    private eventPaths: string[] = [];


    // คอลเลกชันสำหรับคูลดาวน์คำสั่ง

    private cooldowns: Collection<string, Collection<string, number>>;


    // รวบรวมสำหรับกลุ่มคำสั่ง

    private groups: Collection<string, string[]>;

    // สร้างอินสแตนซ์สำหรับคอลเลกชันทั้งหมด

    private newCollections() {
        this.commands = new Collection<string, Command>();
        this.events = new Collection<string, Event>();
        this.cooldowns = new Collection<string, Collection<string, number>>();
        this.groups = new Collection<string, string[]>();
    }

    constructor(client: DiscordClient) {
        this.client = client;
        this.newCollections();
    }

    /**
     * อีเวนท์เดียว
     * @param event Event object
     */
    private registerEvent(event: Event) {
        if (this.events.some(e => e.name === event.name)) throw new RegistryError(`A event with the name "${event.name}" is already registered.`);

        this.events.set(event.name, event);
        this.client.on(event.name, event.run.bind(event));
        Logger.log('INFO', `Event "${event.name}" loaded.`);
    }


    // อีเวนท์ุทั้งหมด

    private registerAllEvents() {
        const events: any[] = [];

        if (this.eventPaths.length)
            this.eventPaths.forEach(p => {
                delete require.cache[p];
            });

        requireAll({
            dirname: path.join(__dirname, '../events'),
            recursive: true,
            filter: /\w*.[tj]s/g,
            resolve: x => events.push(x),
            map: (name, filePath) => {
                if (filePath.endsWith('.ts') || filePath.endsWith('.js')) this.eventPaths.push(path.resolve(filePath));
                return name;
            }
        });

        for (let event of events) {
            const valid = isConstructor(event, Event) || isConstructor(event.default, Event) || event instanceof Event || event.default instanceof Event;
            if (!valid) continue;

            if (isConstructor(event, Event)) event = new event(this.client);
            else if (isConstructor(event.default, Event)) event = new event.default(this.client);
            if (!(event instanceof Event)) throw new RegistryError(`Invalid event object to register: ${event}`);

            this.registerEvent(event);
        }
    }

    /**
     * คำสั่งเดียว
     * @param command Command object
     */
    private registerCommand(command: Command) {
        if (
            this.commands.some(x => {
                if (x.info.name === command.info.name) return true;
                else if (x.info.aliases && x.info.aliases.includes(command.info.name)) return true;
                else return false;
            })
        )
            throw new RegistryError(`A command with the name/alias "${command.info.name}" is already registered.`);

        if (command.info.aliases) {
            for (const alias of command.info.aliases) {
                if (
                    this.commands.some(x => {
                        if (x.info.name === alias) return true;
                        else if (x.info.aliases && x.info.aliases.includes(alias)) return true;
                        else return false;
                    })
                )
                    throw new RegistryError(`A command with the name/alias "${alias}" is already registered.`);
            }
        }

        this.commands.set(command.info.name, command);
        if (!this.groups.has(command.info.group)) this.groups.set(command.info.group, [command.info.name]);
        else {
            const groups = this.groups.get(command.info.group) as string[];
            groups.push(command.info.name);
            this.groups.set(command.info.group, groups);
        }
        Logger.log('INFO', `Command "${command.info.name}" loaded.`);
    }


    // คำสั่งทั้งหมด
    private registerAllCommands() {
        const commands: any[] = [];

        if (this.commandPaths.length)
            this.commandPaths.forEach(p => {
                delete require.cache[p];
            });

        requireAll({
            dirname: path.join(__dirname, '../commands'),
            recursive: true,
            filter: /\w*.[tj]s/g,
            resolve: x => commands.push(x),
            map: (name, filePath) => {
                if (filePath.endsWith('.ts') || filePath.endsWith('.js')) this.commandPaths.push(path.resolve(filePath));
                return name;
            }
        });

        for (let command of commands) {
            const valid = isConstructor(command, Command) || isConstructor(command.default, Command) || command instanceof Command || command.default instanceof Command;
            if (!valid) continue;

            if (isConstructor(command, Command)) command = new command(this.client);
            else if (isConstructor(command.default, Command)) command = new command.default(this.client);
            if (!(command instanceof Command)) throw new RegistryError(`Invalid command object to register: ${command}`);

            this.registerCommand(command);
        }
    }

    /**
     * ค้นหาและส่งคืนคำสั่งตามชื่อหรือชื่อย่อ
     * @param command Name or alias
     */
    findCommand(command: string): Command | undefined {
        return this.commands.get(command) || [...this.commands.values()].find(cmd => cmd.info.aliases && cmd.info.aliases.includes(command));
    }

    /**
     * ค้นหาและส่งคืนคำสั่งในกลุ่มตามชื่อกลุ่ม
     * @param group Name of group
     */
    findCommandsInGroup(group: string): string[] | undefined {
        return this.groups.get(group);
    }


    // ส่งกลับชื่อกลุ่มทั้งหมด
    getAllGroupNames() {
        return [...this.groups.keys()];
    }

    /**
     * ส่งคืนการประทับเวลาของคำสั่ง
     * @param commandName Name of the command
     */
    getCooldownTimestamps(commandName: string): Collection<string, number> {
        if (!this.cooldowns.has(commandName)) this.cooldowns.set(commandName, new Collection<string, number>());
        return this.cooldowns.get(commandName) as Collection<string, number>;
    }

    // อีเวนท์และคำสั่ง
    registerAll() {
        this.registerAllCommands();
        this.registerAllEvents();
    }

    /**
     * ลบอีเวนท์ทั้งหมดออกจากไคลเอนต์จากนั้นอีเวนท์ & คำสั่งอีกครั้ง รีเซ็ตกลุ่มและคูลดาวน์
     *
     * เรียกใช้ฟังก์ชันนี้ในขณะที่ไคลเอ็นต์ออฟไลน์อยู่
     */
    reregisterAll() {
        const allEvents = [...this.events.keys()];
        allEvents.forEach(event => this.client.removeAllListeners(event));
        this.newCollections();
        this.registerAll();
    }
}
