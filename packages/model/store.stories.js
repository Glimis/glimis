import {Store,Model,PollingModel} from "./src/index";

import StoreTable from "../store-table";

import _ from 'lodash'

export default {
  title: '模型/store',
};



// 存在模型层中的代码
class Demo1Store extends Store {
  pageSize = 100;
  fields = [
    {
      name: 'id', mapping:'key'
    },
    {
      name: 'label', mapping:'value'
    },
    {
    name: 'disabled', convert:function(item){      
      // 前端业务写死
      return item.key === 1
    }
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


export const Demo1 =  (args, { argTypes }) => ({
  data(){
    return {
        data:[],
        rawData:[],
        loading:false
    }
  },
  created(){
    this.store = new Demo1Store()
    // 原始数据
    this.store.on('rawData',rawData=>this.rawData = rawData)
    // view 数据，会通过 field 进行转换， 交给其他组件使用
    this.store.on('data',data=>this.data = data)
    // 加载状态
    this.store.on('loading',loading=>this.loading = loading)

    this.store.load()
  },
  template: `
  <div> 
    <div>fields可以做简单的映射和前端写死的逻辑,当交付给业务组件是需要做格式转换,可以使用fields</div>
    <div>原始数据:{{rawData}}</div>
    <div>field转换后的数据:{{data}}</div>
    <div>loading:{{loading}}</div>
  </div>
  `,
});

Demo1.storyName = "单个"




class Demo2Model extends Model {
  proxy = {
    type: "VueResourceProxy",
    api: {
      read: "/mock/model.json",
    },

    reader : {
      rootProperty: "data.data",
    }
  };
  

}


// 存在模型层中的代码
class Demo2Store extends Store {
    pageSize = 100;

    fields = [{
      // 包含一个单框需要的详情
      name: 'dialog', model:Demo2Model
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
  
  
export const Demo2 =  (args, { argTypes }) => ({
  data(){
    return {
      // 此处为主业务数据
      dialogVisible:false,
      row:undefined,
      // 通常dialog 会在此封装，此处为 dialog 的data
      rowData:undefined
    }
  },
  components:{
    StoreTable
  },
  created(){
    this.store = new Demo2Store()
    this.store.load()
  },
  methods:{
    load(row){
        this.dialogVisible = true
        this.row = row
        const dialogModel = this.row.dialog

        // 是否使用缓存
        this.rowData = dialogModel.getData()
        // if(!this.rowData ){
          // 注意,如果使用 on,摧毁时 需要回退，一种节省的方式 是使用 once
          // 逻辑上，在超时时，once 也不对 【但是省事】
        dialogModel.once('rawData',rowData=>this.rowData = rowData)
        dialogModel.load({})
        // }
    }
  },
  template: `
  <div> 
    <div>当一个接口中的模型由多个接口组合形成：如点击弹框，异步加载更多的详情</div> 
    <div>注1：异步一定包含一致性问题，即异步中的数据是否可以缓存,此类操作在dialog中实现</div> 
    <div>注2：也可以通过模型的自定义事件进行实现</div> 
    <StoreTable :store="store">
      <el-table-column prop="key" label="key"></el-table-column>
      <el-table-column prop="key" label="key">
        <template slot-scope="props">
          <el-button @click="load(props.row)">点击详情,加载更多数据</el-button>
        </template>
      </el-table-column>
    </StoreTable>

    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%">
    <div>需要等待1s,此处并未处理loading</div>
    <div>{{rowData}}</div>
  </el-dialog>
  </div>
  `,
});

Demo2.storyName = "聚合"







  class Demo3Model extends Model {
    proxy = {
      type: "VueResourceProxy",
      api: {
        read: "/mock/progress.json",
      },
  
      reader : {
        rootProperty: "data.data",
      }
    };
  }
  
  
  
  // 存在模型层中的代码
  class Demo3Store extends Store {
      pageSize = 100;
  
      fields = [{
        // 包含一个单框需要的详情
        name: 'progress', model:Demo3Model
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
    
    
    export const Demo3 =  (args, { argTypes }) => ({
      components:{
        StoreTable,
        // 在组件中，描述轮训 -- 轮训代表业务
        Progress:{
          props:['row'],
          data(){
            return {
              data:{}
            }
          },
          watch:{
            row:{
              immediate:true,
              handler(newRow,oldRow){
                if(newRow.key === 1){
                  this.i = 0
                  /**
                   * 注意，在组件中 描述轮训时，一定要注意 是否引入了 for 循环
                   * 
                   * for循环，会复用组件，但会打散整个模型的生命周期
                   * 如 进入第二页时，组件可能会形成复用，此时将不会触发 create 等初始化函数
                   * 加入 我们将初始化 注入在 create中，第二页的 模型可能就不会进入到 模型的初始化中
                   * 故此时，需要 进行特殊处理
                   * 
                   */
                  
                  newRow.progress.on('data',this.setData)
      
                  newRow.progress.load()
  
                  if(oldRow){
                    oldRow.progress.un('data',this.setData)
                  }
                }
              }
            }
          },
          methods:{
            setData(data){
                this.i++;
                /**
                 *  注意，此时必须缓存 老款的模型
                 * setTimeout 中的 this.row.progress 可能是修改过的
                 * 会污染 模型
                 * 【setTimeout + props 的bug】
                 */
                const progress = this.row.progress
                this.data=data.num + this.i
                // 业务2：判断是否关闭轮训
                if(this.i<50){
                  setTimeout(()=>{
                    progress.load()
                  },1000)
                }
            }
          },
          destroyed(){
            this.row.progress.un('data',this.setData)
          },
          template:`
          <div>{{data}}</div>
          `
        }
      },
      created(){
        this.store = new Demo3Store()
        this.store.load()
      },
      template: `
      <div> 
        <div>轮训一定包含业务 【start/stop】</div>
        <div>此处使用 组件的方式，描述轮训</div> 
        <StoreTable :store="store">
          <el-table-column prop="key" label="key"></el-table-column>
          <el-table-column prop="key" label="key">
            <template slot-scope="props">
              <Progress :row="props.row"></Progress>
            </template>
          </el-table-column>
        </StoreTable>
      </div>
      `,
    });
    
  Demo3.storyName = "基于组件轮训-需要注意"
  
  
