import ytdl from 'ytdl-core';
import youtubeSearch from "youtube-search";

const URL_REGEX = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

var opts: youtubeSearch.YouTubeSearchOptions = {
    maxResults: 2,
    key: process.env.YOUTUBE_API_KEY
};

export = {
    find: async function (query: string): Promise<{ link?: string, title?: string }> {
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

        console.info(`Finding URL for query: ${query}`)

        try {
            const { results } = await youtubeSearch(query, opts);

            if (results.length === 0) {
                throw new Error(`Could not find video from query: ${query}`);
            }
    
            const { link, title } = results[0];
    
            console.info(`Found video for query ${query}: ${title}`);
    
            return { link, title };
        } catch (err) {
            console.error(`Issue when searching for video`, err);
            throw new Error(`Issue searching for video`)
        }
    }
}
