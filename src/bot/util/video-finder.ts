import ytdl from 'ytdl-core';
import superagent from 'superagent';

const URL_REGEX = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export class VideoFinder {
    find = async (query: string): Promise<{ link: string, title?: string }> => {
        if (URL_REGEX.test(query)) {
            console.info('Query is a URL')
            if (ytdl.validateURL(query)) {
                console.info('Query URL is a valid video')
                return { link: query };
            } else {
                console.info('Query URL is NOT a valid video')
                throw new Error('URL does not map to a video');
            }
        }

        console.info(`Finding URL for query: ${query}`);

        try {
            return await this.videoSearch(query);
        } catch (err) {
            console.error(`Issue when searching for video`, err);
            throw new Error(`Issue searching for video`)
        }
    };

    private videoSearch = async (query: string) => {
        const params = {
            key: process.env.YOUTUBE_API_KEY,
            q: encodeURIComponent(query),
            maxResults: 2,
            part: 'snippet'
        };

        let response = await superagent
            .get(`${BASE_URL}?${this.toQueryString(params)}`)
            .set('Accept', 'application/json');

        if (response.body?.items.length) {
            const title = response.body?.items[0].snippet.title
            console.log(`Video found`, title)
            return {
                link: `https://www.youtube.com/watch?v=${response.body?.items[0].id.videoId}`,
                title
            };
        } else {
            throw new Error(`Could not find video from query: ${query}`);
        }
    };

    private toQueryString = (obj: any) => {
        var str = [];
        for (let p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return str.join("&");
    };
}