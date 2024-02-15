import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { VideoRequest } from '../util/models/video';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    async execute({ interaction, audioHandlers }: ExecuteArgs) {
        let queue: VideoRequest[] = audioHandlers.get(interaction.guildId)?.queue;

        let desc = '';
        
        if (queue) {
            queue.forEach((item, index) => {
                desc += `${index + 1}. ${item.title} \n`
            });    
        } else {
            return await interaction.reply('Nothing in the queue! Use the play command to add songs.');
        }

        const embed = new EmbedBuilder().setTitle('Queue').setDescription(desc);
        return await interaction.reply({ embeds: [embed] });
    }
}


