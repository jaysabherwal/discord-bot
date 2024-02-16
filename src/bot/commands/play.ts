import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, ExecuteArgs } from "../util/models/command";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { AudioHandler } from "../util/models/audio-handler";
import { VideoInfo, VideoRequest } from "../util/models/video";
import { YouTubeVideo, stream, video_basic_info, yt_validate } from "play-dl";
import { ytmusic } from "../util/yt-music";
import { SongDetailed } from "ytmusic-api";
import logger from "../util/logger";

export default class implements Command {
  data = new SlashCommandBuilder()
    .addStringOption((opt) =>
      opt
        .setName("query")
        .setDescription("The URL or name of the video you want to play")
        .setRequired(true)
    )
    .setDescription("Play the sound of a video from YouTube")
    .setName("play");

  async execute({ interaction, audioHandlers }: ExecuteArgs) {
    await interaction.deferReply();
    try {
      let voiceConnection = audioHandlers.get(
        interaction.guildId
      )?.voiceConnection;

      if (!voiceConnection) {
        const guild = interaction.client.guilds.cache.get(interaction.guildId);
        const member = guild.members.cache.get(interaction.member.user.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
          return await interaction.editReply(
            ":sob: You are not in a voice channel!"
          );
        }

        await interaction.editReply("Joining voice channel...");

        voiceConnection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        this.addLifeCycleStateChanges(
          voiceConnection,
          audioHandlers,
          interaction.guildId
        );

        const audioPlayer = createAudioPlayer();
        const queue: VideoRequest[] = [];

        audioHandlers.set(guild.id, {
          voiceConnection,
          audioPlayer,
          queue,
        });

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
          if (queue.length > 0) {
            const item = queue.shift();
            this.playAudio(item, audioPlayer);
            interaction.channel.send(
              `:notes: Playing \`${item.title}\` by \`${item.artist}\``
            );
          }
        });

        voiceConnection.subscribe(audioPlayer);
        logger.info(`Successfully joined channel ${voiceChannel.id}`);
      }

      const query = interaction.options.get("query").value as string;

      await interaction.editReply("Searching...");

      let video: VideoInfo =
        query.startsWith("https") && yt_validate(query) == "video"
          ? await this.getVideoInformationFromUrl(query)
          : await this.getVideoInformationFromQuery(query);

      const item: VideoRequest = {
        ...video,
        requester: interaction.user.username,
      };

      const { audioPlayer, queue } = audioHandlers.get(interaction.guildId);

      if (
        audioPlayer.state.status === AudioPlayerStatus.Playing ||
        audioPlayer.state.status === AudioPlayerStatus.Buffering
      ) {
        queue.push(item);
        return await interaction.editReply(
          `:notes: Added \`${item.title}\` by \`${item.artist}\` to the queue`
        );
      } else {
        try {
          this.playAudio(item, audioPlayer);
          return await interaction.editReply(`:notes: Playing ${item.title}`);
        } catch (error) {
          logger.error(`Error while creating audio resource`, error);
          return await interaction.editReply(`:sob: Error playing video`);
        }
      }
    } catch (error) {
      logger.error("Error playing video", JSON.stringify(error));
      return await interaction.editReply(
        ":sob: Error playing video, please try again"
      );
    }
  }

  private searchVideo = async (query: string): Promise<SongDetailed> => {
    logger.info(`Finding video for query: ${query}`);

    const songs = await ytmusic.searchSongs(query);

    if (songs.length === 0) {
      throw new Error(`Error finding video for query: ${query}`);
    } else {
      return songs[0];
    }
  };

  private getArtistFromVideoId = async (videoId: string): Promise<string> => {
    logger.info(`Finding arstist for video id: ${videoId}`);

    const song = await ytmusic.getSong(videoId);

    if (!song && !song.artist) {
      throw new Error(`Error finding artist for video id: ${videoId}`);
    } else {
      return song.artist.name;
    }
  };

  private getVideoInformation = async (url: string): Promise<YouTubeVideo> => {
    const information = await video_basic_info(url);

    if (!information) {
      throw new Error(`Error getting video inforamtion for url: ${url}`);
    } else {
      return information.video_details;
    }
  };

  private getVideoInformationFromQuery = async (
    query: string
  ): Promise<VideoInfo> => {
    logger.info(`Finding video info for query: ${query}`);

    const song = await this.searchVideo(query);
    const information = await this.getVideoInformation(
      `https://www.youtube.com/watch?v=${song.videoId}`
    );

    return {
      url: information.url,
      title: information.title,
      duration: information.durationInSec,
      artist: song.artist.name,
    };
  };

  private async getVideoInformationFromUrl(url: string): Promise<VideoInfo> {
    logger.info(`Getting video information for url: ${url}`);

    const information = await this.getVideoInformation(url);
    const artist = await this.getArtistFromVideoId(information.id);

    return {
      url: information.url,
      title: information.title,
      duration: information.durationInSec,
      artist: artist,
    };
  }

  private async playAudio(item: VideoRequest, audioPlayer: AudioPlayer) {
    const playStream = await stream(item.url);
    const resource = createAudioResource(playStream.stream, {
      inputType: playStream.type,
      inlineVolume: true,
      metadata: {
        ...item,
      },
    });
    audioPlayer.play(resource);
  }

  private addLifeCycleStateChanges(
    vc: VoiceConnection,
    audioHandlers: Map<string, AudioHandler>,
    guildId: string
  ) {
    vc.on(VoiceConnectionStatus.Destroyed, () => {
      audioHandlers.delete(guildId);
    });

    vc.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
      try {
        await Promise.race([
          entersState(vc, VoiceConnectionStatus.Signalling, 5_000),
          entersState(vc, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        vc.destroy();
      }
    });
  }
}
