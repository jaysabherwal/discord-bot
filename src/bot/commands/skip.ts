import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { AudioPlayer } from "@discordjs/voice";
import { AudioCommandInput } from "../util/models/audio-command-input";


export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song');

    execute({ interaction, audioHandlers }: AudioCommandInput) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            interaction.reply(`:sob: ${interaction.client.user.username} is not playing anything`);
            return;
        }

        ap.stop(true) ? interaction.reply(`Successfully skipped song`) : interaction.reply(`:sob: Failed to skip song`);
    }
}


