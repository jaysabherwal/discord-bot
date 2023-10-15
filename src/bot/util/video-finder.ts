import ytdl from 'ytdl-core';
import superagent from "superagent";

const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export class VideoFinder {
  find = async (
    query: string
  ): Promise<{ link: string; title?: string }> => {
    if (ytdl.validateURL(query)) {
      return { link: query };
    }

    console.info(`Finding URL for query: ${query}`);

    try {
      return await this.videoSearch(query);
    } catch (err) {
      console.error(`Issue when searching for video`, err);
      throw err;
    }
  };

  private videoSearch = async (query: string) => {
    const params = {
      key: process.env.YOUTUBE_API_KEY,
      q: encodeURIComponent(query),
      maxResults: 2,
      part: "snippet",
    };

    let response = await superagent
      .get(`${BASE_URL}?${this.toQueryString(params)}`)
      .set("Accept", "application/json");

    if (response.body?.items.length) {
      const title = response.body?.items[0].snippet.title;
      console.log(`Video found`, title);
      return {
        link: `https://www.youtube.com/watch?v=${response.body?.items[0].id.videoId}`,
        title,
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
