import {Store,StoreManager} from "../model";
import TableCellOpt from './src/index.vue';
import TableCellOptItem from './src/item.vue';
import _ from 'lodash'

export default {
  title: 'store/TableCellOpt',
  component: TableCellOpt,
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
    components: { 
        TableCellOpt,
        TableCellOptItem
    },
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
    <TableCellOpt>
        <TableCellOptItem>保存</TableCellOptItem>
        <TableCellOptItem>新增</TableCellOptItem>
        <TableCellOptItem>创建</TableCellOptItem>
        <TableCellOptItem>激活</TableCellOptItem>
    </TableCellOpt>
  </div>
  `,
});

Demo1.storyName = "Store实例"

