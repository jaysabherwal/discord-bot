import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, ExecuteArgs } from "../util/models/command";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { AudioHandler } from "../util/models/audio-handler";
import { SongInfo, SongRequest } from "../util/models/song";
import { logger } from "../util/logger";
import { AutocompleteInteraction } from "discord.js";
import { spotify_api } from "../util/api/spotify";
import YouTube from "youtube-sr";
import DiscordYTDLCore from "discord-ytdl-core";

export default class implements Command {
  data = new SlashCommandBuilder()
    .addStringOption((opt) =>
      opt
        .setName("query")
        .setDescription("Song name you want to search for")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDescription("Play a song")
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
        const queue: SongRequest[] = [];

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

      await interaction.editReply("Searching...");

      const query = interaction.options.get("query").value as string;

      const query_parts = query.split('/');

      const song: SongInfo = await spotify_api.getTrackInfo(query_parts[query_parts.length - 1]);
      const yt_data = await YouTube.searchOne(`${song.title} - ${song.artist}`);

      const item: SongRequest = {
        ...song,
        url: yt_data.url,
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

  async autoComplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const songs = await spotify_api.getTracks(focusedValue);

    const choices = songs.map((song) => ({
      name: `${song.title} - ${song.artist}`,
      value: song.url
    }));
    await interaction.respond(choices);
  };

  private async playAudio(item: SongRequest, audioPlayer: AudioPlayer) {
    const playStream = DiscordYTDLCore(item.url, {
      filter: 'audioonly',
      opusEncoded: true
    });

    const resource = createAudioResource(playStream, {
      inputType: StreamType.Opus,
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
