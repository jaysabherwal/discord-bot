import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { Song } from '../util/models/song';
import { AudioCommandInput } from "../util/models/audio-command-input";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<void> {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        return await interaction.reply('Queue has been cleared.')
    }
}


