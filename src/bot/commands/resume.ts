import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayer } from '@discordjs/voice';
import { Command, ExecuteArgs } from "../util/models/command";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playback');

    async execute({ interaction, audioHandlers }: ExecuteArgs) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(':sob: Bot was not playing anything');
            return;
        }

        return ap.unpause() ? await interaction.reply('Resumed!') : await interaction.reply('Failed to resume audio');
    }
}


