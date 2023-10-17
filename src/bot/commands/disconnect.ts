import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";
import { VoiceConnection } from "@discordjs/voice";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect the bot from the voice channel');

    execute({ interaction, audioHandlers }: ExecuteArgs) {
        const vc: VoiceConnection = audioHandlers.get(interaction.guildId)?.voiceConnection;
        const username = interaction.client.user.username;

        if (!vc) {
            interaction.reply(`${username} is not in a voice channel`);
            return;
        }
        
        vc.destroy(true);
        interaction.reply(`${username} successfully disconnected!`);
    }
}


