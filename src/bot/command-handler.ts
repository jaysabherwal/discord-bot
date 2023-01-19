import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { AudioCommandInput } from "./util/models/audio-command-input";
import { Command } from "./util/models/command";

export class CommandHandler {
    commands: Collection<string, Command>;

    constructor() {
        this.commands = new Collection();
        this.getCommands();
    }

    executeCommand = async ({ interaction, audioHandlers }: AudioCommandInput) => {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            console.log(`Command not found: ${JSON.stringify(command)}`);
            return await interaction.reply('Command not found!');
        }
        
        try {
            console.log(`Executing command: ${JSON.stringify(command)}`);
            await command.execute({ interaction, audioHandlers });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: ':sad: There was an error while executing this command', ephemeral: true });
        }
    }

    private getCommands = (): void => {
        const files = readdirSync(`${__dirname}/commands`).filter(file => (file.endsWith('.ts') || file.endsWith('.js')));
        files.forEach(file => {
            const _class = require(`./commands/${file.split(".")[0]}`);
            let command: Command = new _class.default;

            console.log(`Registered command: ${command.data.name}`);

            this.commands.set(command.data.name, command);
        });
    }
}