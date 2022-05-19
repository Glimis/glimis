<template lang="pug">
    el-select(v-bind="$attrs", v-on="$listeners" :loading="loading" @visible-change="visibleChange")
        el-option(v-for="(item,key) in options" :disabled="item[disabled]?true:false" :key="key",:label="item[labelField]",:value="item[valueField]") 
            slot(:item="item")
</template>
<script>
import _ from 'lodash'
import {Store,StoreManager} from "@glimis/model";

/**
 * store 系列
 * 
 * 
 * store 创建
 * 根据autoLoad 进行初始化
 * 
 * 【组件激活】
 * 判断store状态
 * 如果加载中忽略
 * 如果未成功过,发送请求，显示loading状态
 * 如果成功过，发送请求，加载缓存数据，加载成功后不修改数据源 【缓存策略】
 * 
 * store 为 String
 * 在StoreManager 中寻找store实例
 * 
 * store 为 数组
 * 使用当前数据源
 * 
 * store 为对象 【store创建结构】
 * 创建内置store实例，单独维护
 *
 * store为 Store实例
 * 与其他组件共享Store
 *
 * 注1：继承element组件，如果不设置 v-model,表现与 element组件 一样
 * 注2：同一个 store,会进入单例状态 【如一个页面，多个下拉使用同一个 store】
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
        },
        disabled:{
            type: String,
            default: 'disabled'
        },
        /**
         * 是否包含全部
         */
        hasAll:{
            type: Boolean,
            default: true
        },
        /**
         * 全部的 label 值 
         *
         * 逻辑上还有 全部的value,默认不传/undefined 【has系列，应该是 store 处理，此处简写】
         * 
         */
        allLabel:{
            type: String,
            default: '全部'
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
        // 下拉的数据源
        options(){
            if(this.hasAll){
                return [{
                    [this.valueField]:undefined,
                    [this.labelField]: this.allLabel
                },...this.data]
            }else{
                return this.data
            }
        }
    },
    methods:{
        visibleChange(v){
            /**
             * 当组件激活时 没有通讯且无数据时 需要重新发起通讯请求
             */
           if(v && this.loading === false && this.data.length === 0 ){
               this.vstore?.load && this.vstore.load()
           }
        }
    }
};

</script>
