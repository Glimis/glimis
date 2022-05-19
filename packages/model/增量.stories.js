import { Store, Model, PollingModel } from "./src/index";

import StoreTable from "../store-table";

import _ from 'lodash'
import axios from "axios";

export default {
    title: '模型/增量',
};


// 存在模型层中的代码
class Demo1Store extends Store {
    pageSize = 100;
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/data.json",
        },
        reader: {
            rootProperty: "data.data",
            pageSize: "data.page_size",
            pageTotal: "data.total_count",
            page: "data.page_no",
        },
    };
}


export const Demo1 = (args, { argTypes }) => ({
    components: {
        StoreTable,
        // 用组件，实现模型的组合
        // 此处组件 需要加载 额外的接口 获取数据
        Detail: {
            props: ['row'],
            data() {
                return {
                    data: {}
                }
            },
            async created() {
                const res = await axios.get(`/mock/model.json`)
                this.data = res.data
            },
            template: `
                <div>{{data}}</div>
            `
        }
    },
    created() {
        this.store = new Demo1Store()
        this.store.load()
    },
    template: `
    <div> 
      <div>此处使用 组件组合的方式，实现模型的组合</div> 
      <StoreTable :store="store">
        <el-table-column prop="key" label="key"></el-table-column>
        <el-table-column prop="key" label="key">
          <template slot-scope="props">
            <Detail :row="props.row"></Detail>
          </template>
        </el-table-column>
      </StoreTable>
    </div>
    `,
});

Demo1.storyName = "组合-组件实现"



class Demo2Model extends Model {
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/model.json",
        },

        reader: {
            rootProperty: "data.data",
        }
    };
}


// 存在模型层中的代码
class Demo2Store extends Store {
    pageSize = 100;
    fields = [{
        // 包含一个单框需要的详情
        name: 'detail', model: Demo2Model
    }]
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/data.json",
        },
        reader: {
            rootProperty: "data.data",
            pageSize: "data.page_size",
            pageTotal: "data.total_count",
            page: "data.page_no",
        },
    };
}

// const a = new Demo2Store()
// a.on('data',console.log)
// a.load()



export const Demo2 = (args, { argTypes }) => ({
    components: {
        StoreTable,
        // 用组件，实现模型的组合
        // 此处组件 需要加载 额外的接口 获取数据
        Detail: {
            props: ['model'],
            data() {
                return {
                    data: {}
                }
            },
            watch: {
                model: {
                    immediate: true,
                    handler: function (newModel, oldModel) {
                        newModel.on('data', this.setData)
                        newModel.load()
                        if (oldModel) {
                            oldModel.un('data', this.setData)
                        }
                    }
                }
            },
            methods: {
                setData(data) {
                    this.data = data
                }
            },
            template: `
                <div>{{data}}</div>
            `}},
    created() {
        this.store = new Demo2Store()

        this.store.load()

    },
    template: `
    <div> 
      <div>此处使用 组件组合的方式，实现模型的组合</div> 
      <StoreTable :store="store">
        <el-table-column prop="key" label="key"></el-table-column>
        <el-table-column prop="key" label="key">
          <template slot-scope="props">
            <Detail :model="props.row.detail"></Detail>
          </template>
        </el-table-column>
      </StoreTable>
    </div>
    `,
});

Demo2.storyName = "组合-组件+模型实现"



// 专门服务于 组合的 模型，model为全量
class Demo3Model extends Model {
    // 必添项，初始化后 自动加载
    autoLoad = true
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/model.json",
        },
        reader: {
            rootProperty: "data.data",
        }
    };

    listeners = {
        beforeLoad({ params }) {
            // 修改 params的参数
            params.a = 1
        }
    }
}


// 存在模型层中的代码
class Demo3Store extends Store {
    pageSize = 100;
    fields = [{
        // 包含一个单框需要的详情
        name: 'detail', model: Demo3Model
    }]
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/data.json",
        },
        reader: {
            rootProperty: "data.data",
            pageSize: "data.page_size",
            pageTotal: "data.total_count",
            page: "data.page_no",
        },
    };
}

// const a = new Demo3Store()
// a.on('data',console.log)
// a.load()


export const Demo3 = (args, { argTypes }) => ({
    components: {
        StoreTable,
        // 用组件，实现模型的组合
        // 此处组件 需要加载 额外的接口 获取数据
        Detail: {
            props: ['data'],
            template: `
                <div>{{data}}</div>
            `
        }
    },
    created() {
        this.store = new Demo3Store()
        this.store.load()
    },
    template: `
    <div> 
      <div>此处使用 组件组合的方式，实现模型的组合</div> 
      <StoreTable :store="store">
        <el-table-column prop="key" label="key"></el-table-column>
        <el-table-column prop="key" label="key">
          <template slot-scope="props">
            <Detail :data="props.row.detailData"></Detail>
          </template>
        </el-table-column>
      </StoreTable>
    </div>
    `,
});

Demo3.storyName = "组合-组件+模型实现"


