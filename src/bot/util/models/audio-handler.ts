import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { VideoRequest } from "./video";

export class AudioHandler {
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: VideoRequest[];
}