import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong?');

    async execute({ interaction }: { interaction: CommandInteraction }) {
        await interaction.reply('Pong!');
    }
}


