import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { Song } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
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
        interaction.reply({ embeds: [embed] });
    }
}


