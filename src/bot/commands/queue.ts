import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Command } from "../util/models/command";
import { Song } from '../util/models/song';
import { AudioCommandInput } from "../util/models/audio-command-input";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<void> {
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


