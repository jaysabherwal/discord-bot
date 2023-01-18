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
            console.log(`Command not found: ${command}`);
            return await interaction.reply('Command not found!');
        }
        
        try {
            console.log(`Executing command: ${command}`);
            await command.execute({ interaction, audioHandlers });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: ':sad: There was an error while executing this command', ephemeral: true });
        }
    }

    private getCommands = () => {
        const files = readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.ts'));
        files.forEach(file => {
            const _class = require(`./commands/${file.split(".")[0]}`);
            let command = new _class.default;
            this.commands.set(command.data.name, command);
        });
    }
}