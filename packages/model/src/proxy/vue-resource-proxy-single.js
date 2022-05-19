import {Http} from 'vue-resource'

import VueResourceProxy from './vue-resource-proxy'

const store = {

}
/**
 * 单例
 * 
 */
export default class VueResourceProxySingle extends VueResourceProxy {
    constructor(config  = {}){
        super(config)
    }

    // 通常单例只是请求，此处只处理 read
    read(params = {}){
        
        const url = this.api.read
        store[url] = store[url] || {}
        const key = JSON.stringify(params)
        const rs = store[url][key]

        if(!rs){
            // 初次读
            const promise = super.read(params)

            store[url][key] = promise


            promise.then(res=>{
                store[url][key]  = res
                return res; 
            })
            return promise
        }
        
        if((rs.promise && rs.promise instanceof Promise)){
            // loading 态
            return rs.promise
        }
        if (rs instanceof Promise ) {
            return rs;
          }
        return new Promise((resolve,reject)=>{
            
            resolve(rs)
        })
    }

}


