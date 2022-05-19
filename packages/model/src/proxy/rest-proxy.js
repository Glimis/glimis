import axios from 'axios'
import _ from 'lodash'
import ServerProxy from './server-proxy'

/**
 * 以Axios 为基础  + rest 进行处理
 * 
 * 默认参数
 * 
 * url："""
 * appendId: true 
 * 
 * create/read/update/delete 使用 axios 的参数
 * 
 */
export default class RestProxy extends ServerProxy {
    constructor(config  = {}){
        // 覆盖数据
        // restful 默认的请求参数
        config.actionMethods = Object.assign({
            create: 'POST',
            read: 'GET',
            update: 'PUT',
            delete: 'DELETE'
        },config.actionMethods)

        super(config)

        // 如果包含 读取器
        if(config.getReader){
            this.getReader = config.getReader
        }
        this.url = config.url
        this._config = config

    }

    // 异步的 操作，全部来自 请求 --> Promise
    async create(body){
        return await this.doRequest(()=>{
            
            return {
                url:this.url,
                method:this.actionMethods.create,
                data:body
            }
        })
    }

    // restful
    async read(params){
        
        return await this.doRequest(()=>{
            const method = this.actionMethods.read
            
            // todo: appendId，默认为 true
            if(!this.url){
                throw new Error('需要 url')
            }
          
            if(_.isObject(params)){
                // store
                return {
                    url:this.url,
                    method:this.actionMethods.read,
                    params
                }
            }else{
                // model
                let url = this.url
                if(url[url.length - 1 ] === '/'){
                    url += params
                }else{
                    url +=`/${params}`
                }
                return {
                    url,
                    method
                }
            }
            
            
            
            
        })
    }
    // 默认加id
    update(params){
        // 如果没有id,跳转到 保存
        if(!params.id){
            return this.create(params)
        }
        return this.doRequest(()=>{
            let url = this.url
            if(url[url.length - 1 ] === '/'){
                url += params.id
            }else{
                url +=`/${params.id}`
            }
            
            return {
                url,
                method:this.actionMethods.update,
                data:params
            }
        })
    }
    // 与 destroy 重复
    // 参数传坏了 -。-
    delete({params}){
        // 如果没有id,跳转到 保存
        return this.doRequest(()=>{
            let url = this.url
            if(url[url.length - 1 ] === '/'){
                url += params.id
            }else{
                url +=`/${params.id}`
            }
            return {
                url,
                method:this.actionMethods.delete
            }
        })
    }

    // 请求
    buildRequest(operation){
        
        const options = operation()
        
        return axios({
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

    // rest 请求
    async doRequest(operation){
        let res = await this.buildRequest(operation)
        return this.getReader(res.data)
    }
}


