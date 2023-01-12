import { CommandInteraction } from "discord.js";
import { AudioHandler } from "./audio-handler";

export interface AudioCommandInput {
    interaction: CommandInteraction, 
    audioHandlers: Map<string, AudioHandler>
}