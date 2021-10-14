import { Message, MessageEmbed } from 'discord.js';

import Command from '../../structures/Command';
import DiscordClient from '../../structures/DiscordClient';
import { formatSeconds } from '../../utils/functions';

interface IGroup {
    name: string;
    commands: string[];
}

export default class HelpCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'help',
            group: 'General',
            description: 'คำสั่งอื่นๆ',
            cooldown: 30
        });
    }

    getAvailableGroups(message: Message): IGroup[] {
        const registry = this.client.registry;
        const groupKeys = registry.getAllGroupNames();
        const groups: IGroup[] = [];

        groupKeys.forEach(group => {
            const commandsInGroup = registry.findCommandsInGroup(group) as string[];
            const commands: string[] = [];

            commandsInGroup.forEach(commandName => {
                const command = registry.findCommand(commandName) as Command;
                if (!command.isUsable(message)) return;
                commands.push(commandName);
            });

            if (commands.length) groups.push({ name: group, commands });
        });

        return groups;
    }

    async sendHelpMessage(message: Message, groups: IGroup[]) {
        const embed = new MessageEmbed({
            color: '#20BFFF',
            title: 'HelpXZ',
            footer: {
                text: `ลอง "${this.client.config.prefix}help [command-name]" สำหรับข้อมูลเพิ่มเติม.`
            }
        });

        groups.forEach(group => embed.addField(`${group.name} Commands`, group.commands.map(x => `\`${x}\``).join(' ')));
        await message.channel.send({ embeds: [embed] });
    }

    async run(message: Message, args: string[]) {
        const groups = this.getAvailableGroups(message);

        if (!args[0]) return await this.sendHelpMessage(message, groups);

        const command = this.client.registry.findCommand(args[0].toLocaleLowerCase());
        if (!command) return await this.sendHelpMessage(message, groups);
        var isAvailable = false;

        groups.forEach(group => {
            if (group.commands.includes(command.info.name)) isAvailable = true;
        });

        if (!isAvailable) return await this.sendHelpMessage(message, groups);

        const embed = new MessageEmbed({
            color: '#20BFFF',
            title: 'Help',
            fields: [
                {
                    name: 'ชื่อ',
                    value: command.info.name
                },
                {
                    name: 'กลุ่ม',
                    value: command.info.group
                },
                {
                    name: 'คูลดาวน์',
                    value: command.info.cooldown ? formatSeconds(command.info.cooldown) : 'ไม่มีคูลดาวน์'
                },
                {
                    name: 'ใช้งานได้ที่',
                    value: command.info.onlyNsfw ? 'ช่อง NSFW' : 'ช่องข้อความทั้งหมด'
                },
                {
                    name: 'ชื่อย่อ',
                    value: command.info.aliases ? command.info.aliases.map(x => `\`${x}\``).join(' ') : 'ไม่มีชื่อย่อ'
                },
                {
                    name: 'ตัวอย่างการใช้งาน',
                    value: command.info.examples ? command.info.examples.map(x => `\`${x}\``).join('\n') : 'ไม่มีตัวอย่าง'
                },
                {
                    name: 'คำอธิบาย',
                    value: command.info.description ? command.info.description : 'ไม่มีคำอธิบาย'
                }
            ]
        });

        if (command.info.require) {
            if (command.info.require.developer) embed.setFooter('นี่คือคำสั่งของนักพัฒนา');
            if (command.info.require.permissions) embed.addField('ข้อกำหนดในการอนุญาต', command.info.require.permissions.map(x => `\`${x}\``).join('\n'));
        }

        await message.channel.send({ embeds: [embed] });
    }
}
