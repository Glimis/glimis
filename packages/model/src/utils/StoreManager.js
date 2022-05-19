import _ from 'lodash'

// const storeManagers = {

// }

/**
 * store 集合 StoreManager 中的实例对象化
 */
class StoreCollection {
    constructor(){
        // storeManagers[namespace] = this
        this.stores = {}
    }
    get(storeId){
        return this.stores[storeId]
    }
    set(storeId,store){
        this.stores[storeId] = store
    }

    getKeys(){
        return _.keys(this.stores)
    }
}


export default new StoreCollection()
