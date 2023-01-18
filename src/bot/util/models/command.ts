import { SlashCommandBuilder } from "@discordjs/builders";
import { InteractionResponse } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute({}): Promise<InteractionResponse>;
}