export class SongInfo {
    url?: string;
    title: string;
    duration: string;
    artist: string;
}

export class SongRequest extends SongInfo {
    requester: string;
}