import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { Song } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        interaction.reply('Queue has been cleared.')
    }
}


