<style scoped lang="less">
.list-card-operation {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .search-input {
        width: 360px;
    }
}

.list-card-items {
    margin: 14px 0 24px 0;
}
</style>
<template>
    <div class="list-card">
        <!-- 搜索区域 -->
        <div class="list-card-operation">
            <t-button @click="formVisible1 = true">添加 SDKAPPID</t-button>
            <!-- <t-input v-model="searchValue" class="search-input" placeholder="请输入房间号" clearable>
                <template #suffix-icon>
                    <search-icon v-if="searchValue === ''" size="20px" />
                </template>
            </t-input> -->
        </div>
        <!-- Table区域 -->
        <t-enhanced-table ref="table" row-key="key" :expandedRow="expandedRowRender" :expandIcon="isExpandIcon"
            :expanded-row-keys="expandedRowKeys" @expand-change="onExpandChange" :columns="columns" :data="data" :tree="{
                childrenKey: 'childrenList',
                checkStrictly: checkStrictly === 'true' ? true : false,
                // 第 3 列显示树形结构展开节点
                treeNodeColumnIndex: 0,
                expandTreeNodeOnClick: true,
            }" :height="'100%'" :scroll="{ type: 'virtual', rowHeight: 49, bufferSize: 10 }"
            :selected-row-keys="selectedRowKeys" lazyLoad @select-change="rehandleSelectChange"
            @row-click="onRowClick"></t-enhanced-table>


        <!-- 房间弹窗 -->
        <t-dialog header="房间管理" :visible.sync="formVisible" :width="680" :footer="false">
            <div slot="body">
                <!-- 表单内容 -->
                <t-form :data="formData" ref="form" @submit="onSubmit" :labelWidth="100">
                    <t-form-item label="房间号" name="name">
                        <t-input :style="{ width: '480px' }" v-model="formData.roomId" placeholder="请输入房间号"></t-input>
                    </t-form-item>
                    <t-form-item label="是否静音" name="muteAudio">
                        <t-radio-group v-model="formData.muteAudio">
                            <t-radio value="0">是</t-radio>
                            <t-radio value="1">否</t-radio>
                        </t-radio-group>
                    </t-form-item>
                    <t-form-item label="字符串房间" name="muteAudio">
                        <t-radio-group v-model="formData.stringRoom">
                            <t-radio value="0">是</t-radio>
                            <t-radio value="1">否</t-radio>
                        </t-radio-group>
                    </t-form-item>
                    <t-form-item style="float: right">
                        <t-space size="10px">
                            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
                            <t-button theme="primary" type="submit">确定</t-button>
                        </t-space>
                    </t-form-item>
                </t-form>
            </div>
        </t-dialog>

        <!-- SDKAPPID 弹窗 -->
        <t-dialog header="添加 SDKAPPID" :visible.sync="formVisible1" :width="680" :footer="false">
            <div slot="body">
                <!-- 表单内容 -->
                <t-form :data="formData1" ref="form" @submit="onSubmit1" :labelWidth="100">
                    <t-form-item label="SDKAPPID" name="SDKAPPID">
                        <t-input :style="{ width: '480px' }" v-model="formData1.sdkAppId"
                            placeholder="请输入 SDKAPPID"></t-input>
                    </t-form-item>
                    <t-form-item label="SECRETKEY" name="SECRETKEY">
                        <t-input :style="{ width: '480px' }" v-model="formData1.secretkey"
                            placeholder="请输入 SECRETKEY"></t-input>
                    </t-form-item>
                    <t-form-item style="float: right">
                        <t-space size="10px">
                            <t-button variant="outline" @click="onClickCloseBtn1">取消</t-button>
                            <t-button theme="primary" type="submit">确定</t-button>
                        </t-space>
                    </t-form-item>
                </t-form>
            </div>
        </t-dialog>
    </div>
</template>
<script lang="jsx">
import { EnhancedTable, Input, MessagePlugin, Switch } from 'tdesign-vue';
import cloneDeep from 'lodash/cloneDeep';
import VideoCard from '@/components/video-card/index.vue';
import { SearchIcon, CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon, ChevronRightCircleIcon } from 'tdesign-icons-vue';


// 初始化数据，按照这个数组结构输入多个sdkappid；每个sdkappid下childrenList为多个房间
const initialData = [
    {
        key: '20011234', // key，代码结构需要，可以随意填但是不能重复
        sdkAppId: 20011234,
        secretkey: '',
        childrenList: [
            {
                key: '20011234_2333', // 这里可以使用 sdkappid_roomid的格式填入key
                roomId: 2333,
                isMuteAudio: true,
                isStringRoom: false // 字符串roomid: true
            },
            {
                key: '3',
                roomId: 455,
                isMuteAudio: true,
                isStringRoom: false
            },
        ]
    }
];

const INITIAL_DATA = {
    roomId: '',
    muteAudio: '',
    stringRoom: '',
    key: '',
};
const INITIAL_DATA1 = {
    key: '',
    sdkAppId: 0,
    secretkey: '',
};

export default {
    name: 'monitor',
    components: { SearchIcon, TEnhancedTable: EnhancedTable },
    data() {
        return {
            searchValue: '',
            checkStrictly: 'true',
            formVisible: false,
            formVisible1: false,
            expandedRowKeys: [],
            selectedRowKeys: [],
            editableRowKeys: [],
            parentMap: {},
            formData: { ...INITIAL_DATA },
            isAddChildren: false,
            formData1: { ...INITIAL_DATA1 },
            columns: [
                { colKey: 'sdkAppId', title: 'SDKAPPID', width: 200 },
                { colKey: 'secretkey', title: 'SECRETKEY', width: 400 },
                {
                    colKey: 'roomId',
                    title: '房间号',
                    width: 200,
                },
                {
                    colKey: 'operation',
                    title: '操作',
                    width: 150,
                    fixed: 'right',
                    cell: (h, { row }) => {
                        let isEdit = row.roomId ? true : false;
                        let isAdd = row.childrenList ? true : false;
                        return (
                            <div class="tdesign-table-demo__table-operations">
                                {isAdd && <t-link variant="text" hover="color" onClick={() => this.appendTo(row)}>
                                    添加
                                </t-link>}
                                {isEdit && (<t-link variant="text" hover="color" onClick={() => this.onEditClick(row)}>
                                    编辑
                                </t-link>)}
                                <t-popconfirm content="确认删除吗" onConfirm={() => this.onDeleteConfirm(row)}>
                                    <t-link variant="text" hover="color">
                                        删除
                                    </t-link>
                                </t-popconfirm>
                            </div>
                        );
                    },
                },
            ],
            data: initialData,
        }
    },
    watch: {
        // 切换模式，重置数据，避免互相影响
        checkStrictly() {
            this.selectedRowKeys = [];
            this.data = cloneDeep(initialData);
        },
    },
    mounted() {
    },
    methods: {
        onEditClick(row) {
            this.formData.roomId = row.roomId;
            this.formData.muteAudio = row.isMuteAudio ? '0' : '1';
            this.formData.stringRoom = row.isStringRoom ? '0' : '1';
            this.formData.key = row.key;
            this.formVisible = true;
            this.isAddChildren = false;
        },
        // 新增子节点
        appendTo(row) {
            this.formData.roomId = '';
            this.formData.muteAudio = '0';
            this.formData.stringRoom = '1';
            this.formData.key = row.key;

            this.formVisible = true;
            this.isAddChildren = true;
        },
        onDeleteConfirm(row) {
            this.$refs.table.remove(row.key);
            // 移除子节点
            // this.$refs.table.removeChildren(row.key);
            this.$message.success('删除成功');
        },
        onSubmit({ result, firstError }) {
            if (!firstError) {
                let key = this.formData.key;
                if (this.isAddChildren) {
                    key += '_' + this.formData.roomId;
                }

                let newData = {
                    key: key,
                    roomId: this.formData.roomId,
                    isMuteAudio: this.formData.muteAudio === '0' ? true : false,
                    isStringRoom: this.formData.stringRoom === '0' ? true : false
                };
                console.log(newData);
                if (this.isAddChildren) {
                    this.$refs.table.appendTo(this.formData.key, newData);
                    this.$message.success(`已添加房间： ${this.formData.roomId} ，请展开查看`);
                    console.log(this.data);

                } else {
                    this.$refs.table.setData(this.formData.key, newData);
                    this.$message.success('提交成功');
                }
                this.formVisible = false;
            } else {
                console.log('Errors: ', result);
                this.$message.warning(firstError);
            }
        },
        onSubmit1({ result, firstError }) {
            if (!firstError) {
                console.log(this.formData1);
                this.$refs.table.appendTo('', {
                    key: this.formData1.sdkAppId,
                    sdkAppId: parseInt(this.formData1.sdkAppId),
                    secretkey: this.formData1.secretkey,
                    childrenList: []
                });
                this.$message.success('添加成功');
                this.formVisible1 = false;
            } else {
                console.log('Errors: ', result);
                this.$message.warning(firstError);
            }
        },
        onClickCloseBtn() {
            this.formVisible = false;
            this.formData = {};
        },
        onClickCloseBtn1() {
            this.formVisible1 = false;
            this.formData1 = {};
        },
        isExpandIcon(h, { row }) {
            if (row.childrenList) {
                return false;
            }
            return <ChevronRightCircleIcon />;
        },
        rehandleSelectChange(value, { selectedRowData }) {
            this.selectedRowKeys = value;
            console.log(value, selectedRowData);
        },
        expandedRowRender(h, { row }) {
            let strRoomId = '';
            let roomId = 0;
            if (row.isStringRoom) {
                strRoomId = row.roomId;
            } else {
                roomId = parseInt(row.roomId);
            }

            const allRowData = this.$refs.table.getData(row.key);
            console.log('luodong', allRowData.parent.row);


            let enterParam = {
                sdkAppId: allRowData.parent.row.sdkAppId,
                secretkey: allRowData.parent.row.secretkey,
                roomId: roomId,
                strRoomId: strRoomId,
                isMuteAudio: row.isMuteAudio,
            }
            return <VideoCard enterRoomParam={enterParam} />;
        },
        onExpandChange(val) {
            this.expandedRowKeys = val;
        },
        onRowClick(data) {
            console.log(data);
        },
    },
}
</script>
