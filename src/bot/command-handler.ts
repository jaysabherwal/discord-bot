import { AutocompleteInteraction, Collection } from "discord.js";
import { readdirSync } from "fs";
import { Command, ExecuteArgs } from "./util/models/command";
import { logger } from "./util/logger";

export class CommandHandler {
  commands: Collection<string, Command>;

  constructor() {
    this.commands = new Collection();
    this.getCommands();
  }

  executeAutoComplete = async (interaction: AutocompleteInteraction) => {
    const command = this.commands.get(interaction.commandName);

    try {
      logger.info(`Executing auto complete: ${JSON.stringify(command)}`, {
        interactionId: interaction.id,
      });
      command.autoComplete(interaction);
    } catch (error) {
      logger.error(
        `Error thrown while executing auto complete`,
        JSON.stringify(error),
        `id: ${interaction.id}`
      );
    }
  };

  executeCommand = async ({ interaction, audioHandlers }: ExecuteArgs) => {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Command not found: ${JSON.stringify(command)}`, {
        interactionId: interaction.id,
        userId: interaction.user.id,
      });
      return await interaction.reply("Something went wrong!");
    }

    try {
      logger.info(`Executing command: ${JSON.stringify(command)}`, {
        interactionId: interaction.id,
      });
      command.execute({ interaction, audioHandlers });
    } catch (error) {
      logger.error(
        `Error thrown while executing command`,
        JSON.stringify(error),
        `id: ${interaction.id}`
      );
      await interaction.reply({
        content: ":sob: There was an error while executing this command",
        ephemeral: true,
      });
    }
  };

  private getCommands = (): void => {
    const files = readdirSync(`${__dirname}/commands`).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );
    files.forEach((file) => {
      const _class = require(`./commands/${file.split(".")[0]}`);
      let command: Command = new _class.default();

      logger.info(`Registered command: ${command.data.name}`);

      this.commands.set(command.data.name, command);
    });
  };
}
