import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { AudioCommandInput } from "../util/models/audio-command-input";
import youtube_url_finder from "../util/video-finder";
import ytdl from 'ytdl-core';
import { InteractionResponse } from 'discord.js';

export default class implements Command {

    data = new SlashCommandBuilder()
        .addStringOption(opt => opt.setName('query').setDescription('The URL or name of the song you want to play').setRequired(true))
        .setDescription('Play the sound of a video from YouTube')
        .setName('play')

    async execute({ interaction, audioHandlers }: AudioCommandInput): Promise<InteractionResponse> {
        let vc = audioHandlers.get(interaction.guildId)?.voiceConnection;

        if (!vc) {
            try {
                const guild = interaction.client.guilds.cache.get(interaction.guildId)
                const member = guild.members.cache.get(interaction.member.user.id);
                const voiceChannel = member.voice.channel;
                
                if (!voiceChannel) {
                    return await interaction.reply(':sob: You are not in a voice channel!');
                }

                vc = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
                });

                this.onStateChange(vc, audioHandlers, interaction.guildId);

                const audioPlayer = createAudioPlayer();
                const queue = [];
                
                audioHandlers.set(guild.id, {
                    voiceConnection: vc,
                    audioPlayer: audioPlayer,
                    queue
                });

                audioPlayer.on(AudioPlayerStatus.Idle, () => {
                    if (queue.length > 0) {
                        const item = queue.shift();
                        const resource = createAudioResource(ytdl(item.url, { filter: 'audioonly', quality: 'highestaudio' }))
                        audioPlayer.play(resource);
                        interaction.channel.send(`Playing ${item.title}`);
                    }
                });
    
                vc.subscribe(audioPlayer);
            } catch (e) {
                return await interaction.reply(':sob: Error joining voice channel');
            }
        }

        try {
            const { first: video  } = await youtube_url_finder.find(interaction.options.get('query').value as string);

            if (!video) {
                console.info('Video not found.');
                throw new Error('Video not found.');
            }

            console.info('YT video found')

            const song = {
                url: video.url,
                title: video.title,
            }

            const { audioPlayer, queue } = audioHandlers.get(interaction.guildId);

            if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
                queue.push(song);
                return await interaction.reply(`Added song to the queue`);
            } else {
                try {
                    console.info('Creating audio resource');
                    const resource = createAudioResource(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));
                    audioPlayer.play(resource);
                    console.info('Playing video');
                    return await interaction.reply(`Playing video: ${song.title}`);
                } catch (e) {
                    return await interaction.reply(`:sob: Error playing video`);
                }   
                
            }
        } catch (e) {
            return await interaction.reply(`:sob: Error finding video`);
        }
    }

    private onStateChange(vc: VoiceConnection, audioHandlers, guildId) {
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


