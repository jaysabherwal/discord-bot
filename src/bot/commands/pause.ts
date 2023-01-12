import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { AudioPlayer } from "@discordjs/voice";
import { AudioCommandInput } from "../util/models/audio-command-input";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause bot output');

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<void> {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(`:sad: ${interaction.client.user.username} is not playing anything`);
        }
        
        return ap.pause() ? await interaction.reply('Paused!') : await interaction.reply('Failed to pause audio');
    }
}


