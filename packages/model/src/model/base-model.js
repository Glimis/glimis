import _ from 'lodash'

import AbstractModel from './abstract-model'
// import listenersViewModel from '..//listeners'


export default class Model extends AbstractModel{
    constructor(config){
        super(config)
        this.loading = false
    }


    // 创建，将数据覆盖给模型
    async create (){
        try {
            this.setLoading(true)
            const data = await this.getProxy().create(this.getData())
            this.setData(data)    
            this.setLoading(false)
        } catch (error) {
            this.setLoading(false)
            throw error
        }
    }
    
    
    async read(params){
        try {
            if(!this.proxy){
                return
            }
            
            this._preParams = params

            this.fire('beforeLoad',{params})
            this.setLoading(true)
            
            
            const res = await this.getProxy().read(params)
            
            // 读写器 为一个集合，model只需要root
            const root = res.root
            this.setData(root)
            this.setLoading(false)

            return root
        } catch (error) {
            
            this.setLoading(false)
            throw error
        }
    }

    /**
     * 
     * 修正 包含全量与增量是否返回 --》 不确定
     * 
     */
    async update (params){
        
        try {
            this.setLoading(true)
            await this.getProxy().update(this.getData())
            // this.setData(res)
            this.setLoading(false)
        } catch (error) {
            this.setLoading(false)
            throw error
        }
    }

    // 删除 -- 同理
    async erase (params){
        try {
            this.setLoading(true)
            await this.getProxy().erase(params)
            // this.setData(res)
            this.setLoading(false)
        } catch (error) {
            this.setLoading(false)
            throw error
        }
    }

    // 追加 生命周期
    setData(data){
        this._data = data
        this.fire('data',_.cloneDeep(data))
        this.fire('rawData',this._data)
    }
    // 别名系列
    // 加载模型 --> 缓存查询条件
    load(params){
        // fix1: params 在 restful时，为 字符串
        const preParams = this.getPreParams()
        if(_.isObject(params) || _.isObject(preParams)){
            return this.read(Object.assign({},this.getPreParams(),params))
        }
        // fix2 字符串，不存在 搜索的可能 
        // 逻辑上，params为对象，应该只存在 store中
        return this.read(params)
    }

    // 保存模型  -》可能涉及更新
    save(params){
        
        return this.update(params)
    }

    // 删除
    remove(params){
        return this.erase(params)
    }
    
    getLoading(){
        return this.loading
    }
    setLoading(v){
        this.loading  = v
        this.fire('loading',this.loading)
    }

    /**
     * this._preParams  : 最后一次请求proxy的参数，与是否成功无关
     * 这是一个特殊业务逻辑，在经典结构里，请求参数 由控制器/vm 负责保存，模型不需要负责
     * 尤其是 返回结构 相当固定的时候
     */
    getPreParams(){
        return this._preParams
    }

 
}


