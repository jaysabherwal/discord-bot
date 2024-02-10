export class VideoInfo {
    url: string;
    title: string;
    duration: string;
}

export class VideoRequest extends VideoInfo {
    requester: string;
}