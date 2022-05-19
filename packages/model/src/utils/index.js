import {getClazz} from './register'
import AProxy from '../proxy/a-proxy'

/**
 * proxyConfig: 必须为一个 对象
 * 1. 为proxy 实例 ==》 返回
 * 1. 为meta系列
 * 
 */
export function instanceProxy(proxyConfig){
    
    if(proxyConfig instanceof AProxy){
        return proxyConfig
    }

    let proxyClazz = getClazz(proxyConfig.type)
    
    if(!proxyClazz){
        // 空对象可以保证不报错 --
        return 
    }
    return new proxyClazz(proxyConfig)
}


