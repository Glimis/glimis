<template lang="pug">
div
    el-table(v-bind="$attrs", v-on="$listeners" v-loading="loading" :data="data")
        slot
    el-pagination(background layout="prev, pager, next"  @current-change="currentChange" :currentPage="currentPage" :pageSize="pageSize" :total="total")
  
</template>
<script>
import _ from 'lodash'
import {Store,StoreManager} from "@glimis/model";

/**
 * store 系列
 * 
 */
export default {
    props:{
        /**
         * 数据源
         */
        store:{
            type: [Object,Array,String]
        },
    },
    data(){
        return {
            data:[],
            loading:false,
            // 默认分页信息
            currentPage:1,
            pageSize:10,
            total:0
        }
    },
    created(){
        const setData = data=>this.data = data
        const setLoading = loading=>this.loading = loading
        const setPageSize = pageSize=>this.pageSize = pageSize
        const setPageTotal = total=>this.total = total
        const setPage = currentPage=>this.currentPage = currentPage
        

        // store 为 数组
        if( _.isArray(this.store)){
            this.data = this.store
            this.$watch(()=>this.store,data=>this.data = data)
            return
        }
        // store 为 store 对象
        if(this.store instanceof Store){
            this.vstore = this.store
        }

        // 通过 id,获取 实例
        if(_.isString(this.store)){
            const vstore = StoreManager.get(this.store)
            /**
             *  包含两种可能，1 为数组,直接给 data,但不监听
             *  注：比较少见，给 托拉拽 的全局模型
             */
            if(_.isArray(vstore)){
                this.data = this.store
                return
            }
            // 另一种情况为 完整的实例
            this.vstore = vstore
        }
        
        
        // 普通对象
        if(this.store.url){
            this.vstore = new Store({
                proxy : Object.assign({},{
                    type: "RestProxy",
                },this.store)
            })
            
            // 这里只处理 url 的变更
            this.$watch(()=>this.store.url,data=>{
                // 原来的 vstore 需要取消监听
                this.vstore.un('data',setData)
                this.vstore.un('loading',setLoading)
                // 切换数据源，选中数据需要取消
                this.$emit('input',undefined)
                this.data = []
                // 创建新的 store
                this.vstore = new Store({
                    proxy : Object.assign({},{
                        type: "RestProxy",
                    },this.store)
                })
                this.vstore.on('data',setData)
                this.vstore.on('loading',setLoading)
                // 如果有 autoLoad 进行初始化
                // 此处包含 激活 加载，略
            })
        }

        if(!this.vstore){
            return
        }
        
    
        this.vstore.on('data',setData)
        this.vstore.on('loading',setLoading)
        // 注入page 信息【data里只有数组信息】
        this.vstore.on('pageSize',setPageSize)
        this.vstore.on('pageTotal',setPageTotal)
        this.vstore.on('page',setPage)
        
        this.$once('hook:beforeDestroy', () => {
            this.vstore.un('data',setData)
            this.vstore.un('loading',setLoading)
            this.vstore.un('pageSize',setPageSize)
            this.vstore.un('pageTotal',setPageTotal)
            this.vstore.un('page',setPage)
        })

        // 初始化loading
        this.loading = this.vstore.loading
        
        // 1. 加载中与包含数据，将不再进行初始化
        if(this.vstore.loading || this.vstore.getPageTotal()>0){
            return
        }

        /**
         * issue：
         * store 是否需要在 组件中进行加载？
         * 当多个组件使用同一个store 时，会进行多次加载
         */
        
        this.vstore.load()
    },
    methods:{
        currentChange(v){
            this.store.setPage(v)
            this.store.refresh()
        }
    }
};

</script>
