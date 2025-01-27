import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
} from "discord.js";
import { CommandHandler } from "./command-handler";
import { Command } from "./util/models/command";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { AudioHandler } from "./util/models/audio-handler";
import { logger } from "./util/logger";

export class Bot {
  client: Client;
  audioHandlers: Map<string, AudioHandler>;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    const commandHandler = new CommandHandler();

    this.audioHandlers = new Map<string, AudioHandler>();

    this.client.on(Events.ClientReady, () => {
      logger.info(`Logged in as ${this.client.user.tag}`);
    });

    this.client.on(Events.ShardDisconnect, () => {
      logger.info(`Disconnected...`);
    });

    this.login();
    this.registerCommands(commandHandler.commands);
    this.startListening(commandHandler);
  }

  private login() {
    this.client
      .login(process.env.DISCORD_TOKEN)
      .catch((err) => logger.error(err));
  }

  private registerCommands(commands: Collection<string, Command>) {
    const toRegister = commands.map((command) => command.data.toJSON());

    const rest = new REST().setToken(
      process.env.DISCORD_TOKEN
    );

    if (process.env.NODE_ENV === "development") {
      rest
        .put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
          ),
          { body: toRegister }
        )
        .then(() =>
          logger.info(
            `Successfully registered application commands in DEVELOPMENT for guild: ${process.env.GUILD_ID}.`
          )
        )
        .catch(logger.error);
    } else {
      rest
        .put(Routes.applicationCommands(process.env.CLIENT_ID), {
          body: toRegister,
        })
        .then(() =>
          logger.info(
            "Successfully registered application commands in PRODUCTION."
          )
        )
        .catch(logger.error);
    }
  }

  private startListening(commandHandler: CommandHandler) {
    this.client.on(
      Events.InteractionCreate,
      async (interaction: Interaction) => {
        logger.child({
          interactionId: interaction.id,
        });

        logger.info(`Interaction created [id: ${interaction.id}]`);

        if (interaction.isCommand()) {
          commandHandler.executeCommand({
            interaction,
            audioHandlers: this.audioHandlers,
          });
        }

        if (interaction.isAutocomplete()) {
          commandHandler.executeAutoComplete(interaction);
        }
      }
    );
  }
}
