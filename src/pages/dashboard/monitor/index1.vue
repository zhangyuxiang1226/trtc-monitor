<template>
    <div class="list-card">
        <!-- 搜索区域 -->
        <div class="list-card-operation">
            <t-button @click="formVisible = true">房间管理</t-button>
            <t-input v-model="searchValue" class="search-input" placeholder="请输入房间号" clearable>
                <template #suffix-icon>
                    <search-icon v-if="searchValue === ''" size="20px" />
                </template>
            </t-input>
        </div>
        <!-- 卡片列表 -->
        <template>
            <div class="list-card-items">
                <t-row :gutter="[16, 16]" align="center">
                    <t-col :lg="1" :xs="1" :xl="3" v-for="room in roomList.slice(
                        pagination.pageSize * (pagination.current - 1),
                        pagination.pageSize * pagination.current,
                    )" :key="room.index">
                        <VideoCard :enter-room-param="{SDKAppid:0,secretkey:'',roomId:0,strRoomId:'', isMuteAudio: true}" />
                    </t-col>
                </t-row>
            </div>
            <div class="list-card-pagination">
                <t-pagination v-model="pagination.current" :total="pagination.total" :pageSizeOptions="[12, 24, 36]"
                    :page-size.sync="pagination.pageSize" @page-size-change="onPageSizeChange"
                    @current-change="onCurrentChange" />
            </div>
        </template>
        <t-dialog header="房间管理" :visible.sync="formVisible" :width="680" :footer="false">
            <div slot="body">
                <!-- 表单内容 -->
                <t-form :data="formData" resetType="initial" ref="form" style="max-width: 100%" @reset="onReset"
                    @submit="onSubmit">
                    <t-tabs v-model="roomTab" theme="card" addable @add="onAddRoom"
                        style="margin-left: 30px; border: 1px solid var(--td-component-stroke)">
                        <t-tab-panel v-for="(room, index) in formData.Rooms" :key="room.id" :value="room.id"
                            :label="room.label" :destroyOnHide="false">
                            <t-space direction="vertical" size="24px" style="padding: 24px 24px 24px 0">
                                <!-- 重点阅读：数组里面，注意 name 定义，用于区分不同的字段 -->
                                <t-form-item label="房间号" :name="`Rooms[${index}].roomId`" :label-width="80">
                                    <t-input v-model="formData.Rooms[index].roomId" placeholder="请输入房间号"></t-input>
                                </t-form-item>

                                <t-form-item label="是否静音" :name="`Rooms[${index}].mute`" :label-width="80">
                                    <t-radio-group v-model="formData.Rooms[index].mute">
                                        <t-radio value='0'>是</t-radio>
                                        <t-radio value='1'>否</t-radio>
                                    </t-radio-group>
                                </t-form-item>

                                <t-form-item style="margin-left: 100px" :label-width="80">
                                    <t-space size="10px">
                                        <t-button theme="primary" type="submit">提交</t-button>
                                        <t-button theme="default" variant="base" type="reset">重置</t-button>
                                    </t-space>
                                </t-form-item>
                            </t-space>
                        </t-tab-panel>
                    </t-tabs>
                </t-form>
            </div>
        </t-dialog>
    </div>
</template>

<script lang="jsx">
import {
    ThumbUpIcon, ChatIcon, ShareIcon, StopIcon, MoreIcon, UserIcon, SearchIcon
} from 'tdesign-icons-vue';
import { MessagePlugin } from 'tdesign-vue';
import VideoCard from '@/components/video-card/index.vue';

let id = 0;
function getId() {
    id += 1;
    return id;
}

const INITIAL_DATA = {
    Rooms: [
        {
            id: getId(),
            label: '房间-1',
            roomId: 9012,
            mute: '0',
        },
        {
            id: getId(),
            label: '房间-2',
            roomId: 9013,
            mute: '1',
        },
    ],
};


export default {
    name: 'monitor',
    components: {
        ThumbUpIcon,
        ChatIcon,
        ShareIcon,
        StopIcon,
        MoreIcon,
        SearchIcon,
        VideoCard,
    },
    mounted: function (params) {
        this.roomList = this.formData.Rooms.map(item => ({
            ...item,
            roomId:parseInt(item.roomId)
        }));

        this.pagination = {
            ...this.pagination,
            total: this.roomList.length,
        };
    },
    data() {
        return {
            searchValue: '',
            roomList: [],
            pagination: { current: 1, pageSize: 12, total: 0 },
            formVisible: false,
            formData: { ...INITIAL_DATA },
            roomTab: 1,
        };
    },
    methods: {
        icon() {
            return <UserIcon />;
        },
        clickHandler(data) {
            MessagePlugin.success(`选中【${data.content}】`);
        },
        onPageSizeChange(size) {
            this.pagination.pageSize = size;
            this.pagination.current = 1;
        },
        onCurrentChange(current) {
            this.pagination.current = current;
        },
        onClickCloseBtn() {
            this.formVisible = false;
            this.formData = {};
        },
        onSubmit({ result, firstError }) {
            if (!firstError) {
                this.$message.success('提交成功');
                this.roomList = this.formData.Rooms.map(item => ({
                    ...item,
                    roomId:parseInt(item.roomId)
                }));
                this.formVisible = false;
                console.log('luodong', this.roomList);
                
                this.$forceUpdate();
            } else {
                console.log('Errors: ', result);
                this.$message.warning(firstError);
            }
        },
        onReset() {
            this.$message.success('重置成功');
        },
        onAddRoom() {
            const id = getId();
            this.formData.Rooms.push({
                id,
                label: `房间-${id}`,
                roomId: '',
                mute: false,
            });
            this.roomTab = id;
        },
    },
};
</script>
<style scoped lang="less">
.list-card-operation {
    display: flex;
    justify-content: space-between;

    .search-input {
        width: 360px;
    }
}

.list-card-items {
    margin: 14px 0 24px 0;
}
</style>
