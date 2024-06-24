import SpotifyWebApi from "spotify-web-api-node";
import { logger } from "../logger";
import { SongInfo } from "../models/song";

class SpotifyApi {
  spotifyWebApi: SpotifyWebApi;
  tokenExpiry: Date;

  constructor() {
    this.spotifyWebApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    this.getNewAccessToken();
  }

  private getNewAccessToken = async () => {
    const response = await this.spotifyWebApi.clientCredentialsGrant();

    if (response.statusCode !== 200) {
      logger.error(
        `Received ${response.statusCode} while getting client creds`
      );
      return;
    }

    this.spotifyWebApi.setAccessToken(response.body["access_token"]);

    const date = new Date();
    date.setMinutes(date.getMinutes() + 55);
    this.tokenExpiry = date;

    logger.info(this.tokenExpiry);

    logger.info("Refreshed client credentials & set access token");
  };

  private checkAccessTokenIsValid = async () => {
    if (new Date() > this.tokenExpiry) {
      await this.getNewAccessToken();
    }
  };

  private millisecondsToMinutesAndSeconds = (ms: number) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = (ms % 60000) / 1000;
    return seconds == 60
      ? minutes + 1 + ":00"
      : minutes + ":" + (seconds < 10 ? "0" : "") + seconds.toFixed(0);
  };

  getTracks = async (query: string): Promise<SongInfo[]> => {
    await this.checkAccessTokenIsValid();

    if (query === "") {
      logger.info(`Query is empty, returning nothing`);
      return [];
    }

    logger.info(`Finding tracks for query ${query}`);

    const response = await this.spotifyWebApi.searchTracks(query, {
      limit: 10,
    });

    if (response.statusCode !== 200) {
      logger.error(
        `Received ${response.statusCode} while searching for tracks`
      );
      return;
    }

    const tracks = response.body.tracks.items;
    return tracks.map((track: SpotifyApi.TrackObjectFull) => ({
      artist: track.artists[0].name,
      duration: this.millisecondsToMinutesAndSeconds(track.duration_ms),
      title: track.name,
      url: track.external_urls.spotify,
    }));
  };

  getTrackInfo = async (trackId: string): Promise<SongInfo> => {
    await this.checkAccessTokenIsValid();

    logger.info(`Getting information for track id ${trackId}`);

    const response = await this.spotifyWebApi.getTrack(trackId);

    if (response.statusCode !== 200) {
      logger.error(
        `Received ${response.statusCode} while getting track info`
      );
      return null;
    }

    const track = response.body;

    return {
      artist: track.artists[0].name,
      duration: this.millisecondsToMinutesAndSeconds(track.duration_ms),
      title: track.name
    }
  };
}

export const spotify_api = new SpotifyApi();
