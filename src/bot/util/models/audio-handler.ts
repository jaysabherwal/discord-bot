import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { SongRequest } from "./song";

export class AudioHandler {
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: SongRequest[];
}