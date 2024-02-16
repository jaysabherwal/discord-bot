export class VideoInfo {
    url: string;
    title: string;
    duration: number;
    artist: string;
}

export class VideoRequest extends VideoInfo {
    requester: string;
}