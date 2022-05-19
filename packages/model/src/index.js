import StoreManager from './utils/StoreManager'
import {register} from './utils/register'

// 注册实例proxy
import VueResourceProxy from './proxy/vue-resource-proxy'
import VueResourceProxyTotal from './proxy/vue-resource-proxy-total'
import VueResourceProxySingle from './proxy/vue-resource-proxy-single'

import RestProxy from './proxy/rest-proxy'

import Store from './store/base-store'
import ArrayStore from './store/array-store'
import Model from './model/base-model'
import PollingModel from './model/polling'

register('VueResourceProxy',VueResourceProxy)
register('VueResourceProxyTotal',VueResourceProxyTotal)
register('VueResourceProxySingle',VueResourceProxySingle)

register('RestProxy',RestProxy)


register('Store',Store)

register('ArrayStore',ArrayStore)

register('Model',Model)
register('PollingModel',PollingModel)




export {
    VueResourceProxy,
    Model,
    PollingModel,
    Store,
    ArrayStore,
    register,
    StoreManager
}
