import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Song } from "./song";

export class AudioHandler {
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: Song[];
}