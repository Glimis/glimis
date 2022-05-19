import _ from 'lodash'
export default class EventBus{
    constructor(){
        this._events = {}
    }
    on(name,fn){
        this._events[name] = this._events[name] || []
        this._events[name].push(fn)
    }

    once(name,fn){
        this._events[name] = this._events[name] || []
        const proxy = function (...arg){
            this.un(name,proxy)
            return fn.apply(this,arg)
        }
        this._events[name].push(proxy)
    }

    fire(name,...arg){
        
        _.each(this._events[name],(fn)=>{
            fn.apply(this,arg)
        })

        // 注册监听
        this.listeners?.[name] && this.listeners?.[name].apply(this,arg)
    }

    un(name,fn){
        if(this._events[name] ){
            this._events[name] = this._events[name].filter(zfn=>zfn!==fn)
        }
    }

    has(name){
        // 手动监听 或 listeners
        return (this._events[name] && this._events[name].length > 0)  || !!this.listeners?.[name]
    }
}
