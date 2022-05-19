import Store from './base-store'




/**
 *  数据来自data本身
 * 
 *   setData : 设置全量数据，同样的，getData 获取的也是全量数据
 * 
 * 
 */

export default class ArrayStore extends Store{


    constructor(config){
        super(config)
    }

    setRawData(data = []){
        this._rawData = data
        // 进行第一次初始化
        this.setPage(1)
        this.setPageTotal(data.length)
        this.load()
    }
    

    read(){
        const rawData = this._rawData        
        const {page, pageSize, pageTotal} = this.getPagination()
        const data = rawData.slice((page-1)*pageSize,page*pageSize)
        
        this.setData(data)
        this.setPage(page)
    }
}