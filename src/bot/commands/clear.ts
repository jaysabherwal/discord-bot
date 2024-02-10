import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { VideoRequest } from '../util/models/video';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
        let queue: VideoRequest[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        interaction.reply(':page_facing_up: Queue cleared');
    }
}


