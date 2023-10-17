import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayer } from '@discordjs/voice';
import { Command, ExecuteArgs } from "../util/models/command";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playback');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            interaction.reply(':sob: Bot was not playing anything');
            return;
        }

        ap.unpause() ? interaction.reply('Resumed!') : interaction.reply('Failed to resume audio');
    }
}


