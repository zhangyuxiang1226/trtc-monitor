import TRTC from 'trtc-sdk-v5';
import genTestUserSig from '@/utils/gen-test-user-sig';


export const EventEnum = {
    EVENT_VIDEO: 0,
    EVENT_AUDIO: 1
};
export type RtcEvent = (type: number, hasStream: boolean, data: any) => void;
export type enterParame = {
    sdkAppId: number,
    secretkey: string,
    roomId: number,
    strRoomId: string,
    isMuteAudio: boolean;
};

export class Rtc {
    private cloud: TRTC = null;
    private userId: string = 'monitor';
    private onEvent: RtcEvent

    constructor(onEvent: RtcEvent) {
        this.cloud = TRTC.create();
        this.onEvent = onEvent;
    }

    public async enterRoom(param: enterParame) {
        let UserSig = genTestUserSig(this.userId, param.sdkAppId, param.secretkey);
        this.inatellEventHandlers();
        try {
            await this.cloud.enterRoom({
                roomId: param.roomId,
                sdkAppId: param.sdkAppId,
                userId: this.userId,
                userSig: UserSig.userSig,
                role: TRTC.TYPE.ROLE_AUDIENCE,
                scene: TRTC.TYPE.SCENE_LIVE,
                autoReceiveAudio: !param.isMuteAudio
            });
        } catch (error) {
            console.error('enterRoom room failed', error);
        }
    }

    public async exitRoom() {
        await this.cloud.exitRoom();
    }

    public async destroy(){
      await this.cloud.exitRoom();
      await this.cloud.destroy();
    }

    public startRemoteVideo(userId: string, view: HTMLElement) {
        this.cloud.startRemoteVideo({
            userId: userId,
            streamType: TRTC.TYPE.STREAM_TYPE_MAIN,
            view: view,
            option: {
                fillMode: 'contain'
            }
        });
    }

    public stopRemoteVideo(userId: string) {
        this.cloud.stopRemoteVideo({ userId: userId, streamType: TRTC.TYPE.STREAM_TYPE_MAIN });
    }

    public muteRemoteAudio(userId: string, mute: boolean) {
        this.cloud.muteRemoteAudio(userId, mute);
    }

    public setRemoteAudioVolume(userId: string, volume: number) {
        this.cloud.setRemoteAudioVolume(userId, volume);
    }

    private inatellEventHandlers() {
        this.cloud.on(TRTC.EVENT.ERROR, this.handleError);
        this.cloud.on(TRTC.EVENT.CONNECTION_STATE_CHANGED, this.handleConnectionStateChanged);
        this.cloud.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, this.handleRemoteAudioAvailable);
        this.cloud.on(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, this.handleRemoteAudioUnAvailable);
        this.cloud.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, this.handleRemoteVideoAvailable);
        this.cloud.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, this.handleRemoteVideoUnAvailable);
    }


    private handleRemoteVideoAvailable = (event) => {
        console.log('luodong video available true', event);
        this.onEvent(EventEnum.EVENT_VIDEO, true, event);

    }

    private handleRemoteVideoUnAvailable = (event) => {
        console.log('luodong video available false', event);
        this.onEvent(EventEnum.EVENT_VIDEO, false, event);
    }

    private handleRemoteAudioAvailable = (event) => {
        console.log('luodong audio available true', event);
        event.streamType = 'main';
        this.onEvent(EventEnum.EVENT_AUDIO, true, event);
    }

    private handleRemoteAudioUnAvailable = (event) => {
        console.log('luodong audio available false', event);
        event.streamType = 'main';
        this.onEvent(EventEnum.EVENT_AUDIO, false, event);
    }

    private handleConnectionStateChanged = (state) => {
        console.log('luodong', state);
    }

    private handleError = (error) => {
        console.log(`Local error: ${error.message}`);
        alert(error);
    }
}
