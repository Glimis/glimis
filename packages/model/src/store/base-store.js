import _ from 'lodash'
import AbstractStore from './abstract-store'


/**
 * store 数据的集合，包含固定方法
 * 
 * sort() : 排序
 * setPage() : 设置第几页
 * 
 * filter(): 过滤
 * 
 */
export default class BaseStore extends AbstractStore{
    constructor(config){
        
        super(config)
        
        this.loading = false
        
        setTimeout(()=>{
            if(this.autoLoad){
                if(_.isObject(this.autoLoad)){
                    this.load(this.autoLoad)
                }else{
                    this.load()
                }
            }
        })
    }

    

  
    // 将默认的增删改查，修正为 只有查询
    async read(params = {}){
        try {
            if(!this.proxy){
                return
            }
            this._preParams = params
            // 读取当前分页器属性
            let pagination = this.getPagination()
            
            params = _.cloneDeep(params)
            // 此处用于将 params 挂载上 pagination
            
            this.fire('beforeLoad',{params,pagination})
            // fix: beforeLoad 用于手动挂载 pagination，这里有一种意外，后端返回全量数据 或 未定义 beforeLoad
            // 此时,需要手动挂载分页信息
            if(!this.has('beforeLoad')){
                params.page = pagination.page
                params.pageSize = pagination.pageSize
            }
            
            this.setLoading(true)
            // store 返回的 data，必须为 
            /**
                rootProperty:res.body.value.content,
                pageSize: res.body.value.page,
                page: res.body.value.size,
                pageTotal: res.body.value.total
             */
            const res = await this.getProxy().read(params)
            
            this.fire('beforeData',res.res)

            if(!_.isArray(res.root) ){
                // 策略 --》 如果收到异常数据，是否继续添加
                this.fire('errorData',res)
            }else{
                let {root,...pagination} = res
                this.setData(root)
                
                // 分页器属性
                this.setPagination(pagination)
            }
            
            this.setLoading(false)
        } catch (error) {
            /**
             * 如果 当前的请求 与 abort 的请求不一样
             * 说明依然在通讯中
             * issue:
             * 当前是 临时处理，自行abort 如取消，也是一段正常的需求
             * 那么自行abort 将会 无法实现loading=false的问题
             * 显然，这是 Promise 加载后顺序的问题，需要将 下一次请求
             * 放到上一个请求 abort 执行后即可
             */
            if(!error.url){
                
                this.setLoading(false)
            }
        }
    }

    
    // 顺便修正 为第一页
    load(params){ 
        this.setPage(1) // 一定为第一页
        return this.refresh(params)
    }

    // 查询语句增量，依赖之前的 query
    refresh(params){
        return this.read(Object.assign({},this.getPreParams(),params))
    }

    // 下一页
    loadPage(page){
        // 修改分页器属性
        this._pagination.page = page
        this.load()
    }


    getPreParams(){
        return this._preParams
    }

    // 暴露 问题 
    setData(data){
        this._data = data
        this._cache = false
        this.fire('data',this.getData())
        this.fire('rawData',this._data)
    }

    setPagination(pagination){
        
        this.setPage(pagination.page)
        this.setPageSize(pagination.pageSize)
        this.setPageTotal(pagination.pageTotal)
    }

    getPagination(){
        return {
            page:this.getPage(),
            pageSize:this.getPageSize(),
            pageTotal:this.getPageTotal()
        }
    }


    getPage(){
        return this.page || 1
    }

    setPage(page){
        this.page = page || 1
        this.fire('page',this.page)
    }


    // 一页个数
    getPageSize(){
        return this.pageSize || 10
    }

    setPageSize(pageSize){
        
        this.pageSize = pageSize || 10
        this.fire('pageSize',this.pageSize)
    }

    getPageTotal(){
        return this.pageTotal || 0
    }
    setPageTotal(pageTotal){
        this.pageTotal  = pageTotal || 0
        this.fire('pageTotal',this.pageTotal)
    }

    getLoading(){
        return this.loading
    }
    setLoading(v){
        this.loading  = v
        this.fire('loading',this.loading)
    }
    // 待实现
    sort(){}

    filter(){}

}


