<template lang="pug">
    el-radio-group(v-bind="$attrs", v-on="$listeners" )
        el-radio(v-for="item,key in options" :key="key" :label="item[valueField]") {{item[labelField]}}
    
    
</template>
<script>
import _ from 'lodash'
import {Store,StoreManager} from "@glimis/model";

/**
 * 
 * radio 没有激活/折叠的概念 ，不能想select 一样loading，故没有单独loading 【需要ui设置】
 * 
 * 更多的时候是 配合 数组使用
 * 
 * 枚举
 * 
 */
export default {
    props:{
        /**
         * 数据源
         */
        store:{
            type: [Object,Array]
        },
        /**
         * 展示的key值
         */
        labelField: {
            type: String,
            default: 'value'
        },
        /**
         * id的值
         */
        valueField: {
            type: String,
            default: 'key'
        }
    },
    data(){
        return {
            data:[],
            loading:false
        }
    },
    created(){
        const setData = data=>this.data = data
        const setLoading = loading=>this.loading = loading

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
                // fix: 数组赋值
                this.data = vstore
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

        // 1. 加载中与包含数据，将不再进行初始化
        if(this.vstore.loading || this.vstore.getPageTotal()>0){
            return
        }
        this.vstore.load()
    },
    computed:{
        // 数据源
        options(){
            return this.data
        }
    }
};

</script>
