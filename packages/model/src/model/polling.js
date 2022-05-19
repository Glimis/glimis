import _ from 'lodash'

import BaseModel from './base-model'

/**
 * 添加轮训状态
 */
export default class Polling extends BaseModel{
    constructor(config){
        super(config)
        this._status = false
    }

    start(params){
        this._status = true
        
        return this._start(params)
    }

    async _start(params){
        
        if(!this._status){
            return
        }
       
        const res = await this.load(params)
            
        if(this.continue && this.continue(res)){
            
            setTimeout(()=>{
                this._start(params)
            },this.time || 1000)
        }

        
    }

    stop(){
        this._status = false
    }
}


