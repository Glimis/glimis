

import _ from 'lodash'
import EventBus from '../utils/eventBus'
import {instanceProxy} from '../utils/index'
import StoreManager from '../utils/StoreManager'
import PollingModel from '../model/polling'
import Model from '../model/base-model'


/**
 * store 数据的集合，包含固定方法
 * 
 * sort() : 排序
 * filter(): 过滤
 * 
 * setPage()
 */
export default class AbstractStore extends EventBus{
    constructor(config){
        super()

        // pageSize 也可以进行一些初始化描述覆盖
        if(config){
            Object.assign(this,config)
            // if(config.pageSize){
            //     this.pageSize = config.pageSize
            // }

            if(config.id){
                StoreManager.set(config.id,this)
            }
        }
    }

    // 代理 meta实现
    getProxy(){
        if(!this._proxy){
            this._proxy = instanceProxy(this.proxy)
        }
        return this._proxy
    }


    // 集合 特有函数
    sort(){}
    filter(){}
    setPage(){}
    setPageSize(){}



    // 通过序号，读取某个模型
    findModelByIndex(index){
        let data = this.getData(index)
        
        if(this.model){
            const nModel = new this.model()
            nModel.setData(data)
            return nModel
        }
        return data
    }


    
    // 获取 vm 数据
    getData(index){
        
        // bug:需要转换
        if(_.isNumber(index)){
            return this._data[index]
        }
        if(!this._data){
            // 数组 需要默认数据
            return []
        }
        
        // 是否使用缓存
        if(this._cache){
           return this._cp(this.$data )
        }
        this._cache = true
        
        if(this._poolModels && this._poolModels.length > 0){
            _.each(this._poolModels,poolModel=>{
                poolModel.stop()
            })
        }
        // 缓存 轮训模型
        this._poolModels = []
        
        this.$data   = _.map(this._data,(rawItem,index)=>{
            const data = _.cloneDeep(rawItem)
            _.each(this.fields,field=>{
                let v
                
                if(field.mapping){
                    // 有mapping 转移
                    v = _.get(rawItem,field.mapping)
                }else if(field.convert){
                    
                    v = field.convert(data)
                }else if(field.name){
                    // 啥都没有 默认name,但你可以不写
                    v = _.get(rawItem,field.name)
                }
                // 如果包含store,且v是数组，则需要 做二级转换
                if(field.store){
                    const vstore = new field.store()
                    if(_.isArray(v)){
                        vstore.setData(v)
                    }
                    v = vstore
                }
                // 如果包含model,且v是对象，则需要 做二级转换
                if(field.model){
                    const vmodel = new field.model()
                    vmodel.setData(v)
                    v = vmodel
                    
                    if( vmodel instanceof PollingModel){
                        // 处理轮训事件,初始化 数据后，立马触发 是否启动事件
                        vmodel.beforeStart && vmodel.beforeStart(rawItem)
                        // 注3：有个问题，当整个模型被摧毁时，需要停止
                        this._poolModels.push(vmodel)
                    }

                    // 判断是否包含 autoLoad
                    if(vmodel.autoLoad){
                        // 注1：此时，需要将 临时更新的 模型，发送给 最外层
                        // 注2：默认 外层没有使用
                        this._data[index][`${field.name}Data`] = {}
                        data[`${field.name}Data`] = {}
                        vmodel.on('data',(data)=>{
                            // 注3：此处修改数据源
                            this._data[index][`${field.name}Data`] = data
                            this.$data[index][`${field.name}Data`] = data

                            this.fire('data',this._cp(this.$data))
                        })
                        
                        if(!vmodel instanceof PollingModel){
                            vmodel.load(rawItem)
                        }
                    }
                }
                data[field.name] = v
                // 映射后的参数
                // delete data[field.mapping]
                if(field.mapping){
                    _.unset(data,field.mapping)
                }
            })
            
            return data
        })

        // 注意，此处需要给copy 对象，方式 被 observer
        
        return this._cp(this.$data)
    }

    _cp(data){
        
        var  a = _.cloneDeepWith(data,item=>{
            if(item instanceof Model){
                return item
            }else{
                return _.clone(item)
            }
        })
        
        return a
        
    }
    

    // 暴露 问题 
    setData(data){
        this._cache = false
        this._data = data
    }

    setPagination(pagination){
        this._pagination = pagination
    }
 
    destroy(){
        this.getProxy().destroy()
    }

}


