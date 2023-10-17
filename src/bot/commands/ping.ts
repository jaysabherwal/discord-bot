import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, ExecuteArgs } from "../util/models/command";

export default class implements Command {

    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong?');

    execute({ interaction }: ExecuteArgs) {
        interaction.reply('Pong!');
    }
}


