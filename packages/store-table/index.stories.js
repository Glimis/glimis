import {Store,StoreManager} from "../model";
import StoreTable from './src/index.vue';
import _ from 'lodash'

export default {
  title: 'store/table',
  component: StoreTable,
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
  components: { StoreTable },
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
    <StoreTable :store="store" v-model="filter.name">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" >
              <el-form-item label="key">
                <span>{{ props.row.key }}</span>
              </el-form-item>
              <el-form-item label="value">
                <span>{{ props.row.value }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="key"></el-table-column>
        <el-table-column prop="value" label="value"></el-table-column>
    </StoreTable>
  </div>
  `,
});

Demo1.storyName = "Store实例"



