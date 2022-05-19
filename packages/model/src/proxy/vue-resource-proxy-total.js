import {Http} from 'vue-resource'

import ServerProxy from './server-proxy'

/**
 * 以VueResource 为基础 进行处理
 * 
 * 1. 返回的root 为全量 -- 无视读写器其他内容
 * 2. 包含 pageSize ，用于内置分页
 * 
 */
export default class VueResourceProxyTotal extends ServerProxy {
    constructor(config  = {}){
        super(config)

        // 如果包含 读取器
        if(config.getReader){
            this.getReader = config.getReader
        }
        

    }

    // 请求
    buildRequest(operation){
        const options = operation()
        
        const paramsNoPage = _.omit(options.params,'page','pageSize')
        const queryNoPage = _.omit(this._query,'page','pageSize')

        this.previousRequestParams = {
            page:options.params.page || 1,
            pageSize:options.params.pageSize || 10,
        }

        if(this._cache && _.isEqual(paramsNoPage,queryNoPage)){
            // 传递，本地需要查询的 分页对象
            // 使用缓存数据
            return {
                body:this._cache
            }
        }
        
        
        return Http({
            ...options,
            before:(request)=>{
                if (this.previousRequest) {
                  this.previousRequest.abort();
                }
                this.previousRequest = request;
              }
        })
    }
    // 删除请求
    abort(){
        this.previousRequest.abort();
    }

    // 读写器 --> 
    /**
     * rootProperty : 根节点配置
     * 后三个失效
     * pageSize ： 页面大小
     * pageTotal: 总数
     * page: 第N页
     */
     getReader(res){
        const root = _.get(res,this.reader.rootProperty)
        
        // 缓存数据
        this._cache = res
        // previousRequest真实的 查询
        this._query = _.omit(this.previousRequest.params,'page','pageSize')

        // 上一次请求的参数，逻辑上会有bug -- 在abort 时会出现
        const page = this.previousRequestParams.page
        const pageSize = this.previousRequestParams.pageSize
        
        return {
            root:root.slice(pageSize * (page - 1) ,pageSize*page ),
            pageSize,
            pageTotal:root.length,
            page,
            res
        }
     }
}


