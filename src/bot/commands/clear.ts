import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { Song } from '../util/models/song';
import { AudioCommandInput } from "../util/models/audio-command-input";
import { InteractionResponse } from 'discord.js';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<InteractionResponse> {
        let queue: Song[] = audioHandlers.get(interaction.guildId)?.queue;

        queue = [];
        return await interaction.reply('Queue has been cleared.')
    }
}


