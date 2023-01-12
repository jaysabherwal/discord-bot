import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayer } from '@discordjs/voice';
import { Command } from "../util/models/command";
import { AudioCommandInput } from '../util/models/audio-command-input';

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playback');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<void> {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(':sad: Bot was not playing anything');
        }

        return ap.unpause() ? await interaction.reply('Resumed!') : await interaction.reply('Failed to resume audio');
    }
}


