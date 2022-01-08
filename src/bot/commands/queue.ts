import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from "../util/models/command";
import { AudioHandler } from '../util/models/audio-handler';
import { Song } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    async execute({ interaction, audioHandlers }: { interaction: CommandInteraction, audioHandlers: Map<string, AudioHandler>}) {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        let desc = '';
        
        if (queue) {
            queue.forEach((item, index) => {
                desc += `${index + 1}. ${item.title} \n`
            });    
        } else {
            desc += 'Empty!'
        }

        const embed = new MessageEmbed().setTitle('Queue').setDescription(desc);
        return await interaction.reply({ embeds: [embed] });
    }
}


