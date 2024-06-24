import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { SongRequest } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    async execute({ interaction, audioHandlers }: ExecuteArgs) {
        let queue: SongRequest[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        return interaction.reply(':page_facing_up: Queue cleared');
    }
}


