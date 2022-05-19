import { Store, Model, PollingModel } from "./src/index";

import StoreTable from "../store-table";

import _ from 'lodash'
import axios from "axios";
import EventBus from "./src/utils/eventBus";


export default {
    title: '模型/轮训',
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
    
    
    export const Demo1 =  (args, { argTypes }) => ({
      components:{
        StoreTable,
        Progress:{
          props:['row'],
          data(){
            return {
                data:{}
            }
          },
          watch:{
            row:{
                immediate: true,
                handler: function (row) {
                    
                    // 在此处处理 轮训问题
                    this.timeout && clearTimeout(this.timeout)
                    // 假设 轮训条件
                    if(row.key < 1){
                        this.getData()
                    }
                } 
            }
          },
          methods:{
              async getData(){
                const res = await axios.get(`/mock/progress.json`,{
                    params:this.row
                })
                this.data = res.data
                this.timeout = setTimeout(()=>{
                    this.getData()
                },1000)
              }
          },
          destroyed(){
            this.timeout && clearTimeout(this.timeout)
          },
          template:`
          <div>{{data}}</div>
          `
        }
      },
      created(){
        this.store = new Demo1Store()
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
    
  Demo1.storyName = "组件"
    


  class Demo2Model extends Model {
    proxy = {
        type: "VueResourceProxy",
        api: {
            read: "/mock/progress.json",
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
            name: 'progress', model: Demo2Model
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
        components:{
          StoreTable,
          Progress:{
            props:['model'],
            data(){
              return {
                  data:{}
              }
            },
            watch:{
                model: {
                    immediate: true,
                    handler: function (newModel, oldModel) {
                        
                        newModel.on('data', this.setData)
                        newModel.load()
                        if (oldModel) {
                            this.timeout && clearTimeout(this.timeout)
                            oldModel.un('data', this.setData)
                        }
                    }
                }
            },
            methods:{
                setData(data){
                    this.data = data            
                    this.timeout = setTimeout(()=>{
                        this.model.load()
                    },1000)
                }
            },
            destroyed(){
              this.timeout && clearTimeout(this.timeout)
              this.model.un('data', this.setData)
            },
            template:`
            <div>{{data}}</div>
            `
          }
        },
        created(){
          this.store = new Demo2Store()
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
                <Progress :model="props.row.progress"></Progress>
              </template>
            </el-table-column>
          </StoreTable>
        </div>
        `,
      });
      
    Demo2.storyName = "组件+模型"
      

    
/**
 * 创建 polling系列
 * --》 不断的刷新 最外层？ 的 data，规避 vm 问题
 * 
 */
 class Demo3Model extends PollingModel {
    time = 1000

    proxy = {
      type: "VueResourceProxy",
      api: {
        read: "/mock/progress.json",
      },
      reader : {
        rootProperty: "data.data",
      }
    };

    // 也可以放入事件,此处暂定为 唯一函数
    // 此处在 父级 getData时触发
    beforeStart(rawData){
      if(rawData.key < 1){
        //   启动轮训
        this.start(rawData) 
      }
    }
    continue(item){
        this.i = this.i || 0
        this.i ++        
        return this.i < 10
    }
    
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
            name: 'progress', model: Demo3Model
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
          Progress:{
            props:['model'],
            data(){
              return {
                  data:{}
              }
            },
            watch:{
                model: {
                    immediate: true,
                    handler: function (newModel, oldModel) {
                        newModel.on('data', this.setData)
                        // 与 beforeStart 类似
                        // newModel.load({aa:1})
                        if (oldModel) {
                            oldModel.un('data', this.setData)
                        }
                    }
                }
            },
            methods:{
                setData(data){
                    this.data = data
                }
            },
            destroyed(){
              this.model.un('data', this.setData)
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
                <Progress :model="props.row.progress"></Progress>
              </template>
            </el-table-column>
          </StoreTable>
        </div>
        `,
      });
      
    Demo3.storyName = "组件+轮训模型"
      




/**
 * 创建 polling系列
 * --》 不断的刷新 最外层？ 的 data，规避 vm 问题
 * 
 */
 class Demo4Model extends PollingModel {
    autoLoad = true
    time = 1000

    proxy = {
      type: "VueResourceProxy",
      api: {
        read: "/mock/progress.json",
      },
      reader : {
        rootProperty: "data.data",
      }
    };

    // 也可以放入事件,此处暂定为 唯一函数
    // 此处在 父级 getData时触发
    beforeStart(rawData){
      if(rawData.key < 1){
        //   启动轮训
        this.start(rawData) 
      }
    }
    continue(item){
        this.i = this.i || 0
        this.i ++        
        return this.i < 10
    }
    
    listeners = {
        beforeLoad({ params }) {
            // 修改 params的参数
            params.a = 1
        }
    }
  }
  


    // 存在模型层中的代码
    class Demo4Store extends Store {
        pageSize = 100;
        fields = [{
            // 包含一个单框需要的详情
            name: 'progress', model: Demo4Model
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
      
      
      export const Demo4 =  (args, { argTypes }) => ({
        components:{
          StoreTable,
          Progress:{
            props:['data'],
            template:`
            <div>{{data}}</div>
            `
          }
        },
        created(){
          this.store = new Demo4Store()
          this.store.on('data',data=>{
              console.log('子模块通讯时，触发这个',data)
          })
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
                <Progress :data="props.row.progressData"></Progress>
              </template>
            </el-table-column>
          </StoreTable>
        </div>
        `,
      });
      
    Demo4.storyName = "轮训模型"
      

    // 自定义模型
    class Demo5Store extends EventBus{
      

        async load(params){
            const res = await axios.get(`/mock/data.json`,{
                params
            })
            
            this.data = res.data.data.data
            // 触发
            this.fire('data',_.cloneDeep(this.data))
            // 实时性监听 
            // 注：这里应该合并为一个，此处简单的模拟
            _.each(this.data,this.loadProgress.bind(this))
        }

        // 加载进度
        async loadProgress(params,index){

            const res = await axios.get(`/mock/progress.json`,{
                params
            })  
            
            this.data[index].progress = res.data
            // 触发
            this.fire('data',_.cloneDeep(this.data))
            setTimeout(async ()=>{
                this.loadProgress(params,index)
            },1000) 
            
        }
    }


      export const Demo5 =  (args, { argTypes }) => ({
        components:{
          StoreTable,
          Progress:{
            props:['data'],
            template:`
            <div>{{data}}</div>
            `
          }
        },
        data(){
            return {
                data:[]
            }
        },
        created(){
          this.store = new Demo5Store()
          this.store.on('data',data=>this.data = data)
          this.store.load()
        },
        template: `
        <div> 
          <div>轮训一定包含业务 【start/stop】</div>
          <div>此处使用 组件的方式，描述轮训</div> 
          <el-table :data="data">
            <el-table-column prop="key" label="key"></el-table-column>
            <el-table-column prop="key" label="key">
              <template slot-scope="props">
                <Progress :data="props.row.progress"></Progress>
              </template>
            </el-table-column>
          </el-table>
        </div>
        `,
      });
      
    Demo5.storyName = "自定义"
      