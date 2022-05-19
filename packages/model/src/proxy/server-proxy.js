import AProxy from './a-proxy'
import _ from 'lodash'


/**
 * 以ServerProxy 为基础 进行处理
 */
 export default class ServerProxy extends AProxy {
    constructor(config = {}){
        super()
        // 增删 改查 的api
        this.api = Object.assign({},{
            create  : undefined,
            read    : undefined,
            update  : undefined,
            delete : undefined
        },config.api)
        
        this.actionMethods = Object.assign({},{
            create: 'POST',
            read: 'GET',
            update: 'POST',
            delete: 'POST'
        },config.actionMethods)
        
        this.reader = config.reader
        
    }
    // 异步的 操作，全部来自 请求 --> Promise
    async create(body){
        return await this.doRequest(()=>{
            return {
                url:this.api.create,
                method:this.actionMethods.create,
                body
            }
        })
    }
    async read(params){
        
        return await this.doRequest(()=>{
            const method = this.actionMethods.read
            
            const rs = {
                url:this.api.read,
                method
            }
            
            if(method === 'GET'){
                rs.params = params
            }else{
                rs.body = params
            }
            return rs
        })
    }
    async update(params){
        return await this.doRequest(()=>{
            return {
                url:this.api.update,
                method:this.actionMethods.update,
                body:params
            }
        })
    }
    // 与 destroy 重复
    async delete(params){
        return await this.doRequest(()=>{
            return {
                url:this.api.delete,
                method:this.actionMethods.delete,
                ...params
            }
        })
    }
    destroy(...args){
        return this.delete.apply(this,args)
    }
    // 请求
    async doRequest(operation){
        
        let res = await this.buildRequest(operation)
        
        // 转换信息
        return this.getReader(res.body)
    }


    // 创建请求 --  operation [ajax参数]
    buildRequest(operation){}
    // 删除请求
    abort(){}


    // 获取 成功的请求参数
    getRequest(){
        return _.cloneDeep(this._req)
    }

    // 读写器 --> 
    /**
     * rootProperty : 根节点配置
     * pageSize ： 页面大小
     * pageTotal: 总数
     * page: 第N页
     */
    getReader(res){
        return {
            root:_.get(res,this.reader.rootProperty),
            pageSize:_.get(res,this.reader.pageSize),
            pageTotal:_.get(res,this.reader.pageTotal),
            page:_.get(res,this.reader.page),
            res
        }
     }
     getWriter(req){
        return req
     }
}