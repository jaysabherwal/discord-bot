import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Video } from "./video";

export class AudioHandler {
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: Video[];
}