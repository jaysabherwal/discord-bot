import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from "../util/models/command";
import { AudioHandler } from '../util/models/audio-handler';
import { Song } from '../util/models/song';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    async execute({ interaction, audioHandlers }: { interaction: CommandInteraction, audioHandlers: Map<string, AudioHandler>}) {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        return await interaction.reply('Queue has been cleared.')
    }
}


