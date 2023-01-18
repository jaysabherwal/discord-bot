import { CacheType, Collection, CommandInteraction } from "discord.js";
import { readdirSync } from "fs";
import { AudioHandler } from "./util/models/audio-handler";
import { Command } from "./util/models/command";

export class CommandHandler {
    commands: Collection<string, Command>;

    constructor() {
        this.commands = new Collection();
        this.getCommands();
    }

    executeCommand = async (params: { interaction: CommandInteraction<CacheType>, audioHandlers: Map<string, AudioHandler> }) => {
        const { interaction } = params;
        const command = this.commands.get(JSON.stringify(interaction.commandName, null, 2));

        if (!command) {
            console.log(`Command not found: ${command}`);
            return;
        }
        
        try {
            console.log(`Executing command: ${command}`);
            await command.execute(params);
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