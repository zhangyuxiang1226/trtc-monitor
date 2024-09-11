<template>
    <t-row :gutter="[16, 16]" align="center">
        <t-col :lg="1" :xs="1" :xl="3" v-for="user in userList" :key="user.index">
            <t-card theme="poster2" hover-shadow header-bordered :title="user.streamType + ': ' + user.userId">
                <TrtcVideo :user-id="user.userId" :cloud="cloud" :audio-stream="user.audioStream"
                    :video-stream="user.videoStream" />
            </t-card>
        </t-col>
        <t-col :span="12" v-show="userList.length == 0">
            <div style="text-align: center;">没有用户在房间推流</div>
        </t-col>
    </t-row>
</template>
<script lang="jsx">
import { EventEnum, Rtc } from '@/components/rtc';
import TrtcVideo from './trtc-video.vue';


export default {
    name: 'TrtcPlayer',
    props: {
        enterRoomParam: {
            type: Object,
            require: true,
        }
    },
    components: {
        TrtcVideo
    },
    data() {
        return {
            userList: []
        };
    },
    watch: {
        enterRoomParam(val, oldVal) {
            if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
                this.cloud.exitRoom();
                this.userList = [];
                this.cloud.enterRoom(val);
            }
        },
    },
    created() {
        this.cloud = new Rtc((type, hasStream, data) => {
            let userIndex = this.userList.findIndex(user => user.userId === data.userId && user.streamType === data.streamType);
            if (userIndex === -1) {
                this.userList.push({
                    userId: data.userId,
                    streamType: data.streamType,
                    videoStream: type === EventEnum.EVENT_VIDEO ? hasStream : false,
                    audioStream: type === EventEnum.EVENT_AUDIO ? hasStream : false
                });
            } else {
                if (type === EventEnum.EVENT_VIDEO) {
                    this.userList[userIndex].videoStream = hasStream;
                } else if (type === EventEnum.EVENT_AUDIO) {
                    this.userList[userIndex].audioStream = hasStream;
                }
                if (!this.userList[userIndex].videoStream && !this.userList[userIndex].audioStream) {
                    this.userList.splice(userIndex, 1);
                }
            }

            console.log(this.userList);
        });
    },
    destroyed() {
        this.cloud.destroy();
    },
    mounted() {
        this.cloud.enterRoom(this.enterRoomParam);
    },
    methods: {

    }
};
</script>