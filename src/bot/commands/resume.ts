import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayer } from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { Command } from "../util/models/command";
import { AudioHandler } from '../util/models/audio-handler';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playback');

    async execute({ interaction, audioHandlers }: { interaction: CommandInteraction, audioHandlers: Map<string, AudioHandler>}) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(':sad: Bot was not playing anything');
        }

        return ap.unpause() ? await interaction.reply('Resumed!') : await interaction.reply('Failed to resume audio');
    }
}


