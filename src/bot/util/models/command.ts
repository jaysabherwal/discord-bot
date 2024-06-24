import { SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { AudioHandler } from "./audio-handler";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";

export interface Command {
    data: SlashCommandOptionsOnlyBuilder;
    execute(args: ExecuteArgs): void;
    autoComplete?(interaction: AutocompleteInteraction): void;
}

export interface ExecuteArgs {
    interaction: CommandInteraction;
    audioHandlers: Map<string, AudioHandler>;
}