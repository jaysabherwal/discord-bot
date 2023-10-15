import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from "../util/models/command";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import ytdl from 'ytdl-core';
import { AudioCommandInput } from "../util/models/audio-command-input";
import { VideoFinder } from '../util/video-finder';
import { AudioHandler } from '../util/models/audio-handler';

export default class implements Command {

    data = new SlashCommandBuilder()
        .addStringOption(opt => opt.setName('query').setDescription('The URL or name of the song you want to play').setRequired(true))
        .setDescription('Play the sound of a video from YouTube')
        .setName('play')

    async execute({ interaction, audioHandlers }: AudioCommandInput) {
        try {
            interaction.deferReply();

            let voiceConnection = audioHandlers.get(interaction.guildId)?.voiceConnection;

            if (!voiceConnection) {
                const guild = interaction.client.guilds.cache.get(interaction.guildId)
                const member = guild.members.cache.get(interaction.member.user.id);
                const voiceChannel = member.voice.channel;
    
                if (!voiceChannel) {
                    interaction.reply(':sob: You are not in a voice channel!');
                    return;
                }
    
                console.log('Joining VC');
    
                voiceConnection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });
    
                console.log('Adding state changes');
                this.addLifeCycleStateChanges(voiceConnection, audioHandlers, interaction.guildId);
    
                console.log('Create audio player');
                const audioPlayer = createAudioPlayer();
                const queue = [];
    
                audioHandlers.set(guild.id, {
                    voiceConnection,
                    audioPlayer,
                    queue
                });
    
                console.log('Setting on Idle');
    
                audioPlayer.on(AudioPlayerStatus.Idle, () => {
                    if (queue.length > 0) {
                        const item = queue.shift();
                        const resource = createAudioResource(ytdl(item.url, { filter: 'audioonly', quality: 'highestaudio' }));
                        audioPlayer.play(resource);
                        interaction.channel.send(`Playing ${decodeURI(item.title)}`);
                    }
                });
    
                voiceConnection.subscribe(audioPlayer);
            }
    
            const video = await new VideoFinder().find(interaction.options.get('query').value as string);
    
            if (!video) {
                interaction.reply('Issue finding video, please try again later');
                return;
            }
    
            const song = {
                url: video.link,
                title: video.title,
            };
    
            const { audioPlayer, queue } = audioHandlers.get(interaction.guildId);
    
            if (audioPlayer.state.status === AudioPlayerStatus.Playing || audioPlayer.state.status === AudioPlayerStatus.Buffering) {
                console.log(`AudioPlayer is currently playing, adding song to queue`);
                queue.push(song);
                interaction.reply(`Added song to the queue`);
                return;
            } else {
                try {
                    const resource = createAudioResource(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));
                    audioPlayer.play(resource);
                    interaction.reply(`Playing video: ${song.title || song.url}`);
                } catch (error) {
                    console.error(`Error while creating audio resource`);
                    interaction.reply(`:sob: Error playing video`);
                    return;
                }
            }
        } catch (error) {
            console.error();
            interaction.reply('Error playing video');
        }
    } 

    private addLifeCycleStateChanges(vc: VoiceConnection, audioHandlers: Map<string, AudioHandler>, guildId) {
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


