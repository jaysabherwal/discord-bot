import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioHandler } from "./audio-handler";
import { CommandInteraction } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute(args: ExecuteArgs): void;
}

export interface ExecuteArgs {
    interaction: CommandInteraction;
    audioHandlers: Map<string, AudioHandler>;
}