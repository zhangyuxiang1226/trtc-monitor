<style lang="less">
@import '@/style/player';

.video-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    flex-direction: column;
}

.video-placeholder p {
    margin-top: 10px;
    color: #e6e6e6;
    font-size: 15px;
}
</style>
<template>
    <div class="dplayer dplayer-live dplayer-playing" ref="container">
        <div class="dplayer-mask"></div>
        <div class="dplayer-video-wrap" ref="view" :style="videoStyle">
            <div v-show="!isPlaying" class="video-placeholder">
                <MuteVideoIcon :style="{ width: '40%', height: '40%' }" />
                <p>{{ tips }}</p>
            </div>
            <div class="dplayer-logo" v-if="options.logo">
                <img :src="options.logo" alt="Logo" />
            </div>
            <div class="dplayer-danmaku" :style="danmakuStyles">
                <div class="dplayer-danmaku-item dplayer-danmaku-item--demo"></div>
            </div>
            <div class="dplayer-subtitle"></div>
            <div class="dplayer-bezel">
                <span class="dplayer-bezel-icon"></span>
                <template v-if="options.danmaku">
                    <span class="dplayer-danloading" v-text="danmakuLoading"></span>
                </template>
                <span class="diplayer-loading-icon">
                    <LoadingIcon />
                </span>
            </div>
        </div>
        <div class="dplayer-controller-mask"></div>
        <div class="dplayer-controller" style="z-index: 2;">
            <div class="dplayer-icons dplayer-icons-left">
                <button class="dplayer-icon dplayer-play-icon" @click="togglePlayPause" :disabled="!videoStream">
                    <span class="dplayer-icon-content">
                        <PlayIcon v-if="!isPlaying" />
                        <PauseIcon v-else />
                    </span>
                </button>
                <div class="dplayer-volume" :class="{ 'dplayer-volume-active': volIsActive }">
                    <button class="dplayer-icon dplayer-volume-icon" @click="toggleMute">
                        <span class="dplayer-icon-content">
                            <VolumeUpIcon v-if="volume >= 95 && audioStream && !muteAudio" />
                            <VolumeDownIcon v-else-if="volume > 0 && audioStream && !muteAudio" />
                            <VolumeOffIcon v-else />
                        </span>
                    </button>
                    <div class="dplayer-volume-bar-wrap" v-show="audioStream && !muteAudio" data-balloon-pos="up"
                        :data-balloon="volumeWidth" @click="handleVolumeClick" @mousedown="volumeDrag"
                        ref="volumeBarWrapWrap">
                        <div class="dplayer-volume-bar" ref="volumeBarWrap">
                            <div class="dplayer-volume-bar-inner"
                                :style="{ background: options.theme, width: volumeWidth }" ref="volumeBar">
                                <span class="dplayer-thumb" :style="'background: ' + options.theme"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="dplayer-time">
                    <span class="dplayer-ptime">0:00</span> /
                    <span class="dplayer-dtime">0:00</span>
                </span>
                <span v-if="options.live" class="dplayer-live-badge">
                    <span class="dplayer-live-dot" :style="liveDadgeStyle"></span>
                    LIVE
                </span>
            </div>
            <div class="dplayer-icons dplayer-icons-right">
                <div class="dplayer-full">
                    <button class="dplayer-icon dplayer-full-icon" :data-balloon="webFullscreen" data-balloon-pos="up"
                        @click="toggleFullScreen('web')">
                        <span class="dplayer-icon-content">
                            <FullWebIcon />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="jsx">

import PlayIcon from '@/assets/player/play.svg';
import PauseIcon from '@/assets/player/pause.svg';
import VolumeUpIcon from '@/assets/player/volume-up.svg';
import VolumeDownIcon from '@/assets/player/volume-down.svg';
import VolumeOffIcon from '@/assets/player/volume-off.svg';
import FullWebIcon from '@/assets/player/full-web.svg';
import MuteVideoIcon from '@/assets/mute-video.svg';
import LoadingIcon from '@/assets/player/loading.svg';
import utils from '../../utils/utils';
import FullScreen from './full-screen'

export default {
    name: 'TrtcVideo',
    props: {
        userId: {
            type: String,
            request: true,
        },
        cloud: {
            type: Object,
            request: true,
        },
        audioStream: {
            type: Boolean,
            request: true,
        },
        videoStream: {
            type: Boolean,
            request: true,
        },
        options: {
            type: Object,
            request: false,
            default: function () {
                return {
                    live: true,
                    autoplay: false,
                    theme: '#b7daff',
                    loop: false,
                    screenshot: false,
                    airplay: true,
                    chromecast: false,
                    hotkey: true,
                    preload: 'metadata',
                    video: {},
                    mutex: true,
                    preventClickToggle: false,
                    logo: null,
                    danmaku: null
                }
            },
        },
    },
    components: {
        PlayIcon,
        PauseIcon,
        VolumeDownIcon,
        VolumeUpIcon,
        VolumeOffIcon,
        FullWebIcon,
        LoadingIcon,
        MuteVideoIcon,
    },
    watch: {
        videoStream(val, oldVal) {
            this.isPlaying = val;
            if (val) {
                this.cloud.startRemoteVideo(this.userId, this.$refs.view);
            } else {
                this.tips = '暂无视频推流';
            }
        },
        audioStream(val, oldVal) {
            if (val) {
                this.setVolume(1);
            }
        },
    },
    data() {
        return {
            danmakuLoading: '弹幕加载中',
            webFullscreen: '页面全屏',
            isPlaying: false,
            vWidth: 35,
            volumeWidth: '0%', // 初始音量宽度百分比
            volIsActive: false,
            volume: 0,
            fullScreen: null,
            isFullScreen: false,
            tips: '暂无视频推流',
            muteAudio: true
        };
    },
    computed: {
        danmakuStyles() {
            if (this.options.danmaku && this.options.danmaku.bottom) {
                return {
                    'margin-bottom': this.options.danmaku.bottom
                }
            }
            return '';
        },
        videoStyle() {
            if (!this.isFullScreen) {
                return {
                    'aspect-ratio': '16 / 9'
                }
            }
            return '';
        },
        liveDadgeStyle() {
            if (this.videoStream) {
                return {
                    'background-color': '#0f0'
                }
            } else {
                return {
                    'background-color': '#f00'
                }
            }
        }
    },
    mounted() {
        this.fullScreen = new FullScreen(this.$refs.container);
        console.log(this.videoStream);

        if (this.videoStream) {
            this.isPlaying = true;
            this.cloud.startRemoteVideo(this.userId, this.$refs.view);
        }
        if (this.audioStream) {
            this.setVolume(1);
        }
    },
    methods: {
        toggleMute() {
            if (this.audioStream) {
                this.muteAudio = !this.muteAudio;
                this.cloud.muteRemoteAudio(this.userId, this.muteAudio);
            }
        },

        togglePlayPause: function (event) {
            this.isPlaying = !this.isPlaying;
            if (this.isPlaying) {
                this.cloud.startRemoteVideo(this.userId, this.$refs.view);
            } else {
                this.tips = '暂停拉流';
                this.cloud.stopRemoteVideo(this.userId);
            }
        },
        toggleFullScreen(type) {
            this.isFullScreen = !this.isFullScreen;
            this.fullScreen.toggle(type);
        },
        volumeDrag(event) {
            document.addEventListener('mousemove', this.volumeMove);
            document.addEventListener('mouseup', this.volumeUp);
            this.volIsActive = true;
        },
        volumeUp() {
            document.removeEventListener('mousemove', this.volumeMove);
            document.removeEventListener('mouseup', this.volumeUp);
            this.volIsActive = false;
        },
        handleVolumeClick(event) {
            const e = event || window.event;
            const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.$refs.volumeBarWrap) - 5.5) / this.vWidth;
            this.setVolume(percentage);
        },
        volumeMove(event) {
            const e = event || window.event;
            const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.$refs.volumeBarWrap) - 5.5) / this.vWidth;
            this.setVolume(percentage);
        },
        setVolume(percentage) {
            percentage = parseFloat(percentage);
            if (!isNaN(percentage)) {
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.volume = (percentage * 100).toFixed(0);
                let formatPercentage = `${this.volume}%`;
                this.volumeWidth = formatPercentage;
                this.cloud.setRemoteAudioVolume(this.userId, parseInt(this.volume));
            }
        },
    }
}

</script>