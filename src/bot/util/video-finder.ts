import { YTSearcher } from 'ytsearcher';
import ytdl from 'ytdl-core';

const youtube = new YTSearcher(process.env.YOUTUBE_API_KEY);

const options = {
    maxResults: 2,
    type: "video" as "video"
};

const URL_REGEX = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

export = {
    find: async function (query: string): Promise<any> {
        if (URL_REGEX.test(query)) {
            if (ytdl.validateURL(query)) {
                return query;
            } else {
                throw new Error('URL does not map to a video');
            }
        }

        return youtube.search(query, options);
    }
}
