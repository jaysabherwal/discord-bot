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
import ytdl from 'ytdl-core';
import ytSearch, { YouTubeSearchOptions } from "youtube-search";
import logger from "../util/logger";

var opts: YouTubeSearchOptions = {
  maxResults: 10,
  type: 'video',
  key: process.env.YOUTUBE_API_KEY,
  videoCategoryId: '10'
};

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
    try {
      await interaction.deferReply();

      let voiceConnection = audioHandlers.get(
        interaction.guildId
      )?.voiceConnection;

      if (!voiceConnection) {
        const guild = interaction.client.guilds.cache.get(interaction.guildId);
        const member = guild.members.cache.get(interaction.member.user.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
          interaction.editReply(":sob: You are not in a voice channel!");
          return;
        }

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
            interaction.channel.send(`Playing ${item.title}`);
          }
        });

        voiceConnection.subscribe(audioPlayer);
        logger.info(`Successfully joined channel ${voiceChannel.id}`);
      }

      const query = interaction.options.get("query").value as string;

      let video: VideoInfo = ytdl.validateURL(query)
        ? await this.getVideoInformation(query)
        : await this.searchVideo(query);

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
        interaction.editReply(`:notes: Added ${item.title} to the queue`);
        return;
      } else {
        try {
          this.playAudio(item, audioPlayer);
          interaction.editReply(`:notes: Playing ${item.title}`);
          return;
        } catch (error) {
          logger.error(`Error while creating audio resource`, error);
          interaction.editReply(`:sob: Error playing video`);
          return;
        }
      }
    } catch (error) {
      logger.error("Error playing video", JSON.stringify(error));
      interaction.editReply(":sob: Error playing video, please try again");
    }
  }

  private async searchVideo(query: string): Promise<VideoInfo> {
    logger.info(`Finding video for query: ${query}`);

    /** 
     * Adding lyrics to the end of the query to prevent music videos from appearing
     */
    const { results } = await ytSearch(`${query} lyrics`, opts);

    if (!results[0]) {
      throw new Error(`Error finding video for query: ${query}`);
    } else {
      return await this.getVideoInformation(results[0].link);
    }
  }

  private async getVideoInformation(url: string): Promise<VideoInfo> {
    logger.info(`Finding video info for url: ${url}`);

    const response = await ytdl.getInfo(url);

    if (!response) {
      throw new Error(`Error getting video info for url: ${url}`);
    } else {
      return {
        url: response.videoDetails.video_url,
        title: response.videoDetails.title,
        duration: response.videoDetails.lengthSeconds
      };
    }
  }

  private async playAudio(item: VideoRequest, audioPlayer: AudioPlayer) {
    const resource = createAudioResource(
      ytdl(item.url, { filter: 'audioonly' })
    );
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

    vc.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
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