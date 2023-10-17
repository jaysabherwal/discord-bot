import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { AudioPlayer } from "@discordjs/voice";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause bot output');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            interaction.reply(`:sob: ${interaction.client.user.username} is not playing anything`);
            return;
        }
        
        ap.pause() ? interaction.reply('Paused!') : interaction.reply('Failed to pause audio');
    }
}


