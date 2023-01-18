import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { InteractionResponse } from 'discord.js';
import { Command } from "../util/models/command";
import { Song } from '../util/models/song';
import { AudioCommandInput } from "../util/models/audio-command-input";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<InteractionResponse> {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        let desc = '';
        
        if (queue) {
            queue.forEach((item, index) => {
                desc += `${index + 1}. ${item.title} \n`
            });    
        } else {
            desc += 'Empty!'
        }

        const embed = new EmbedBuilder().setTitle('Queue').setDescription(desc);
        return await interaction.reply({ embeds: [embed] });
    }
}


