import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { SongRequest } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current queue');

    async execute({ interaction, audioHandlers }: ExecuteArgs) {
        let queue: SongRequest[] = audioHandlers.get(interaction.guildId)?.queue;

        let desc = '';
        
        if (queue) {
            queue.forEach((item, index) => {
                desc += `[${++index}] \`${item.title}\` by \`${item.artist}\` (${item.duration}) \n`
            });    
        } else {
            return await interaction.reply('Nothing in the queue! Use the play command to add songs.');
        }

        const embed = new EmbedBuilder().setTitle('Queue').setDescription(desc);
        return await interaction.reply({ embeds: [embed] });
    }
}


