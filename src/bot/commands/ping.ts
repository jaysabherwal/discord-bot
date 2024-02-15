import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong?');

    async execute({ interaction }: ExecuteArgs) {
        return await interaction.reply('Pong!');
    }
}


