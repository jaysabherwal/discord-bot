import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { AudioPlayer } from "@discordjs/voice";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current item');

    async execute({ interaction, audioHandlers }: ExecuteArgs) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(`:sob: ${interaction.client.user.username} is not playing anything`);
        }

        return ap.stop(true) ? await interaction.reply(`:track_next: Skipped`) : await interaction.reply(`:sob: Failed to skip`);
    }
}


