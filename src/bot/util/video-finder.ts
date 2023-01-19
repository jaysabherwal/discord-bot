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
            console.info('Query is a URL')
            if (ytdl.validateURL(query)) {
                console.info('Query URL is a valid video')
                return query;
            } else {
                console.info('Query URL is NOT a valid video')
                throw new Error('URL does not map to a video');
            }
        }

        console.info(`Finding URL for query: ${query}`)
        return youtube.search(query, options);
    }
}
