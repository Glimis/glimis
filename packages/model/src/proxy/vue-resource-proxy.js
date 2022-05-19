import {Http} from 'vue-resource'

import ServerProxy from './server-proxy'

/**
 * 以VueResource 为基础 进行处理
 */
export default class VueResourceProxy extends ServerProxy {
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
    /**
     * 删除请求
     * abort 
     * 会进入 当前 catch 中,此时需要改变顺序
     */
    abort(){
        this.previousRequest.abort();
    }
}


