import { Message, MessageEmbed, MessageActionRow, MessageButton, Collector } from 'discord.js';
import Command from '../../structures/Command';
import DiscordClient from '../../structures/DiscordClient';
import moment from 'moment';
export default class ProfileX extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'profile',
            aliases: ['pf'],
            group: 'General',
            description: 'เช็คโปรไฟล์.',
            cooldown: 30
        });
    }
    async run(message: Message, args: string[]) {
       const Target = message.mentions.users?.first() || message.author;
       const Member = message.guild?.members.cache.get(Target.id)

       const PF = new MessageEmbed()
       .setAuthor(`${Target.username}#${Target.discriminator}`, Target.displayAvatarURL({ dynamic: true }))
       .addField('ชื่อ', `\`${Target.username}\``, true)
       .addField('แท็ก', `\`#${Target.discriminator}\``, true)
       .addField('ไอดี', `\`${Target.id}\``, true)
       .addField('เข้าเซิร์ฟเวอร์นี้เมื่อวันที่', `\`${moment(Member?.joinedAt).locale("th").add(543, 'year').format("lll")}\``)
       .addField('สร้างบัญชีเมื่อ', `\`${moment(Target.createdAt).locale("th").add(543, 'year').format("lll")} (${moment(Target.createdTimestamp).locale("th").fromNow()})\``)
       .addField('ยศที่มี', `${Member?.roles.cache.map(r => r).join(' ').replace("@everyone", " ")}`, true)
       .setThumbnail(Target.displayAvatarURL({ dynamic: true }))
       .setColor('#C80CFF')
       await message.reply({embeds: [PF]})
    }
}