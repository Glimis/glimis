import {Store,StoreManager} from "../model";
import StoreSelect from './src/index.vue';
import _ from 'lodash'

export default {
  title: 'store/select',
  component: StoreSelect,
  args: {
  },
};



// 存在模型层中的代码
class Demo1Store extends Store {
  pageSize = 100;
  fields = [{
    name: 'disabled', convert:function(item){      
      // 前端业务写死 或 Promise.all
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
  // props: Object.keys(argTypes),
  components: { StoreSelect },
  beforeCreate(){
    // 可以 通过 helper 进行管理
    this.store = new Demo1Store()
    // this.store.load()
  },
  data(){
    return {
      // 业务中 需要收集的数据
      filter:{
        name:''
      }
    }
  },
  template: `
  <div> 
    <div>业务代码中,无需过多的参数</div>
    <div>选中了:{{filter.name}}</div>
    <StoreSelect :store="store" v-model="filter.name"></StoreSelect>
  </div>
  `,
});

Demo1.storyName = "Store实例"


// 同上
class Demo2Store extends Store {
  pageSize = 100;
  proxy = {
    type: "VueResourceProxy",
    api: {
      read: "/mock/data.json1",
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
  // props: Object.keys(argTypes),
  components: { StoreSelect },
  beforeCreate(){
    this.store = new Demo2Store()
    
  },
  data(){
    return {
      // 业务中 需要收集的数据
      filter:{
        name:''
      }
    }
  },
  template: `
  <div> 
    <div>展示失败将如何处理,激活时会重试</div>
    <div>选中了:{{filter.name}}</div>
    <StoreSelect :store="store" v-model="filter.name"></StoreSelect>
  </div>
  `,
});

Demo2.storyName = "Store实例失败,激活触发"




export const Demo3 =  (args, { argTypes }) => ({
  // props: Object.keys(argTypes),
  components: { StoreSelect },
  created(){
    this.getData()
  },
  data(){
    return {
      // 在业务中进行请求，此时 会在业务 代码中
      // 缓存 请求到的数据,实际上还需要处理loading
      data:{
        select:[]
      },
      // 业务中 需要收集的数据
      filter:{
        name:''
      }
    }
  },
  methods:{
     // 假设在 业务中使用 ajax 远程获取数据
    getData(){
      setTimeout(()=>{
        this.data = {
          select:[{
              "key":1,
              "value":"文案11"
          },{
              "key":2,
              "value":"文案22"
          }]
        }
      },3000)
    }
  },
  template: `
  <div> 
    <div>在业务中处理数据,需要额外的参数，比如loading</div>
    <div>选中了:{{filter.name}}</div>
    <StoreSelect :store="data.select" v-model="filter.name"></StoreSelect>
  </div>
  `,
});

Demo3.storyName = "Store 为静态数据"





export const Demo4 =  (args, { argTypes }) => ({
  // props: Object.keys(argTypes),
  components: { StoreSelect },
  data(){
    return {
      // 业务中 需要收集的数据
      filter:{
        name1:'',
        name2:'',
      }
    }
  },
  template: `
  <div> 
    <div>假设两个下拉有关联</div>
    <div>选中了:{{filter.name}}</div>
    <StoreSelect :hasAll="false" :store="{
      url:'/mock/data.json',
      reader: {
        rootProperty: 'data.data'
      }
    }" v-model="filter.name1"></StoreSelect>
    <StoreSelect :hasAll="false" :store="{
      url:'/mock/data2.json?id='+filter.name1,
      reader: {
        rootProperty: 'data.data'
      }
    }" v-model="filter.name2"></StoreSelect>
  </div>
  `,
});

Demo4.storyName = "Store原型"




// 全部在模型中
class Demo5Store extends Store {
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

StoreManager.set('demo',new Demo5Store())


export const Demo5 =  (args, { argTypes }) => ({
  // props: Object.keys(argTypes),
  components: { StoreSelect },
  data(){
    return {
      // 业务中 需要收集的数据
      filter:{
        name:''
      }
    }
  },
  template: `
  <div> 
    <div>模块等集中管理</div>
    <div>选中了:{{filter.name}}</div>
    <StoreSelect store="demo" v-model="filter.name"></StoreSelect>
  </div>
  `,
});

Demo5.storyName = "通过id管理"
