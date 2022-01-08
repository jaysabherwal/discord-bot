import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { AudioPlayer } from "@discordjs/voice";
import { AudioHandler } from "../util/models/audio-handler";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song');

    async execute({ interaction, audioHandlers }: { interaction: CommandInteraction, audioHandlers: Map<string, AudioHandler>}) {
        const ap: AudioPlayer = audioHandlers.get(interaction.guildId)?.audioPlayer;

        if (!ap) {
            return await interaction.reply(`:sad: ${interaction.client.user.username} is not playing anything`);
        }

        return ap.stop(true) ? await interaction.reply(`Successfully skipped song`) : await interaction.reply(`:sad: Failed to skip song`);
        
    }
}


