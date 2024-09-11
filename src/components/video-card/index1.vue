<style scoped>
.video-wrapper {
    width: 100%;
    /* 或者你可以设置一个具体的宽度 */
    padding-top: 56.25%;
    /* 16:9 的宽高比 */
    position: relative;
}

.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.video-container .view {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 确保视频内容完全覆盖容器 */
}

.controls {
    position: absolute;
    bottom: 0px;
    z-index: 10;
    color: white;
    width: 100%;
    height: 15%;
    background-color: rgba(0, 0, 0, 30%);
}

.controls button {
    margin: 0 10px;
    cursor: pointer;
    opacity: 0.7;
    color: #fff;
}

.controls button:hover {
    opacity: 1;
}

.video-placeholder {
    background-color: black;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* Ensures text is centered */
}

.video-placeholder p {
    color: #e6e6e6;
}
</style>
<template>
    <t-card theme="poster2" :bordered="false">
        <!-- <div class="video-wrapper">
            <div class="video-container" ref="videoContainer">
                <div v-show="!isStreamAvailable" class="video-placeholder">
                    <MuteVideoIcon :style="{ width: '40%', height: '40%' }" />
                    <p>当前无人推流</p>
                </div>
                <div v-show="isStreamAvailable" ref="videoElement" class="view"></div>
                <div class="controls" v-if="isStreamAvailable">
                    <t-button shape="circle" variant="text" @click="togglePlayPause">
                        <play-circle-icon v-if="!isPlaying" size="2em" />
                        <stop-circle-filled-icon v-else size="2em" />
                    </t-button>
                    <t-button :disabled="!isAuidoStreamAvailable" shape="circle" variant="text" @click="toggleMute">
                        <sound-icon v-if="!muteAudio" size="2em" />
                        <sound-mute-1-icon v-else size="2em" />
                    </t-button>
                    <t-button shape="circle" variant="text" @click="toggleFullscreen">
                        <fullscreen-2-icon size="2em" />
                    </t-button>
                </div>
            </div>
        </div> -->
        <div ref="dplayer"></div>
    </t-card>
</template>
<script>
import { PlayCircleIcon, StopCircleFilledIcon, SoundIcon, SoundMute1Icon, Fullscreen2Icon } from "tdesign-icons-vue";
import result from '@/components/result/index.vue';
import MuteVideoIcon from '@/assets/mute-video.svg';
import { EventEnum, Rtc } from '@/components/rtc';
import DPlayer from 'dplayer';

export default {
    name: 'TrtcPlayer',
    components: {
        PlayCircleIcon,
        StopCircleFilledIcon,
        SoundIcon,
        SoundMute1Icon,
        Fullscreen2Icon,
        result,
        MuteVideoIcon,
    },
    props: {
        roomId: {
            type: Number,
            request: true
        },
        muteAudio: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            cloud: null,
            isPlaying: false,
            isStreamAvailable: false,
            isAuidoStreamAvailable: false,
            userId: 'monitor',
            dPlayer: null,
            video:null,
        };
    },
    created() {
        this.cloud = new Rtc(this.roomId, this.muteAudio, (type, hasStream, data) => {
            switch (type) {
                case EventEnum.EVENT_VIDEO:
                    this.isStreamAvailable = hasStream;
                    console.log('luodong', hasStream);
                    if (hasStream) {
                        console.log('luodong111', hasStream);
                        let htmlContent = this.$refs.videoElement;
                        console.log('luodong',  this.video);
                        this.cloud.startRemoteVideo(data.userId, this.dPlayer.video);
                    }
                    this.isPlaying = hasStream;
                    break;
                case EventEnum.EVENT_AUDIO:
                    this.isAuidoStreamAvailable = hasStream;
                    break;
                default:
                    break;
            }
        });

    },
    mounted() {
        this.dPlayer = new DPlayer({
            container: this.$refs.dplayer,
            live: true,
            video: {
                type: 'customHls',
                customType: {
                    customHls: function (video, player) {
                        console.log('luodong',  this);
                         this.video = video;
                    },
                },
            }});
        console.log('luodong', this.dPlayer);
        this.cloud.enterRoom();
    },
    destroyed() {
        this.cloud.exitRoom();
    },
    methods: {
        toggleMute() {
            this.muteAudio = !this.muteAudio;
        },

        togglePlayPause() {
            this.isPlaying = !this.isPlaying;
        },

        toggleFullscreen() {

        },
    }
};
</script>