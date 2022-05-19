import EventBus from '../utils/eventBus'
import {instanceProxy} from '../utils/index'
import StoreManager from '../utils/StoreManager'



export default class AbstractModel extends EventBus{
    constructor(config){
        super(config)
        if(config && config.id){
            StoreManager.set(config.id,this)
        }

        this._cacheStore = {}
        
    }

    // 代理 meta实现
    getProxy(){
        if(!this._proxy){
            this._proxy = instanceProxy(this.proxy)
        }
        return this._proxy
    }

    // 读写器 -- 4函数
    create(){}
    read(){}
    update(){}
    erase(){}

    // 生命周期
    destroy(){
        // 默认删除逻辑，删除获取 id
        const id = this.getData().id
        if(!id)
            throw new Error('不存在id')
        return this.getProxy().destroy({
            params:{
              id
            }
          });
    }

    
    /**
     * 
     * 会根据 fields 与 hasMany 轮训返回结构
     * 
     * @returns 返回视图模型
     */
    getData(){
        // 处理关联问题
        const rs = _.cloneDeep(this._data)
        if(!rs){
            return rs
        }
        _.each(this.fields,field=>{
            // 映射结果
            let v
            if(field.mapping){
                // 有mapping 转移
                v = _.get(rs,field.mapping)
            }else if(field.convert){
                v = field.convert(rs)
            }else if(field.name){
                // 啥都没有 默认name,但你可以不写
                v = _.get(rs,field.name)
            }
          
            if(field.store){
                const vstore = new field.store()
                // 如果 是 静态数据，将结构优先置入
                if(_.isArray(v)){
                    vstore.setData(v)
                }
                v = vstore
            }
            rs[field.name] = v
            // 映射后的参数
            // delete rs[field.mapping]
            if(field.mapping){
                _.unset(rs,field.mapping)
            }
        })

        // _.each(this.hasMany,item=>{
        //     if(item.model  && item.associationKey && item.name){
        //         // 此处必须为 数组
        //         rs[item.name] = _.map(rs[item.associationKey],sitem=>{
        //             const childModel = new item.model();
        //             childModel.setData(sitem)
        //             return childModel.getData()
        //         })
        //         // 清除关联信息
        //         delete rs[item.associationKey]
        //     }
        // })
        
        return rs
    }

    ref(name){
        // 根据 fields 中的name 获取 model/store
        const fieldItem = _.find(this.fields,item=>item.name === name)
        if(!fieldItem){
            return 
        }
        // 如果包含 store
        if(fieldItem.store){
            if(!this._cacheStore[fieldItem.store]){
                const vStore = new fieldItem.store()    
                // 1. 为 全量数据 则data 在 this.data中
                if(this._data[fieldItem.mapping || fieldItem.name]){
                    vStore.setData(this._data[fieldItem.mapping || fieldItem.name])
                }
                this._cacheStore[fieldItem.store] = vStore
            }
            return this._cacheStore[fieldItem.store]
        }
    }

    /**
     * 只返回fields 的结构
     */
    // getFields(){
    //     const raw = this._data
  
    //     const rs = {}
    //     _.each(this.fields,field=>{
    //         rs[field.name] = _.get(raw,field.mapping)
    //     })
    //     _.each(this.hasMany,item=>{
    //         if(item.model  && item.associationKey && item.name){
    //             // 此处必须为 数组
    //             rs[item.name] = _.map(raw[item.associationKey],sitem=>{
    //                 const childModel = new item.model();
    //                 childModel.setData(sitem)
    //                 return childModel.getData()
    //             })
    //         }
    //     })
    //     return rs
    // }

    /**
     * 获取关联的数据
     */
    //  getHasMany(name){
    //     const item = _.find(this.hasMany,item=>item.name===name)
    //     if(!item) return
    //     // 数据源
        
    //     const rs = new item.model()
    //     const data = this._data[item.associationKey]
    //     if(data){
    //         rs.setData(data)
    //     }
    //     return rs;
    //  }

    
    setData(data){
        this._data = data
    }

    getRaw(){
        return this._data
    }

}