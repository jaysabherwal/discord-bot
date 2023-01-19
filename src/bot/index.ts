import { Client, Collection, Events, GatewayIntentBits, Interaction } from 'discord.js';
import { CommandHandler } from './command-handler';
import { Command } from './util/models/command';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AudioHandler } from './util/models/audio-handler';

export class Bot {
    client: Client;
    audioHandlers: Map<string, AudioHandler>;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        const commandHandler = new CommandHandler();

        this.audioHandlers = new Map<string, AudioHandler>();
        
        this.client.on(Events.ClientReady, () => {
            console.info(`Logged in as ${this.client.user.tag}`)
        });
        
        this.client.on(Events.ShardDisconnect, () => {
            console.info(`Disconnected...`)
        });

        this.login();
        this.registerCommands(commandHandler.commands);
        this.startListening(commandHandler);
    }

    private login() {
        this.client.login(process.env.DISCORD_TOKEN).catch(e => console.log(e));
    }

    private registerCommands(commands: Collection<string, Command>) {
        const toRegister = commands.map(command => {
            return command.data.toJSON();
        });
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        if (process.env.DEV === 'true') {
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: toRegister })
                .then(() => console.log('Successfully registered application commands in DEV.'))
                .catch(console.error);
        } else {
            rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: toRegister })
                .then(() => console.log('Successfully registered application commands in PRODUCTION.'))
                .catch(console.error);
        }
    }

    private startListening(commandHandler: CommandHandler) {
        this.client.on(Events.InteractionCreate, (interaction: Interaction) => {
            try {
                if (!interaction.isCommand()) {
                    return;
                }

                commandHandler.executeCommand(
                    {
                        interaction, 
                        audioHandlers: this.audioHandlers
                    }
                );
            } catch (err) {
                console.error(err);
            }
        });
    }
}