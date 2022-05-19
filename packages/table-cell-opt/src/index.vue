<template lang="pug">
    .table-col-opt
        el-button-group
            el-button(type="text" v-for="item,index in btnConfig" :key="index" @click="click(item)" v-bind="item.attrs") {{item.text}}
        el-dropdown(v-if="hasMore")
            el-button(type="text") 更多
            el-dropdown-menu(slot="dropdown")
                el-dropdown-item(v-for="item,index in moreConfig" :key="index" @click.native="click(item)") {{item.text}}
                
</template>
<script>
import _ from 'lodash'


export default {
    props:{
        btns:{
            type: Array
        },
        number:{
            type: Number
        },
        scope: {
            type: Object
        }
    },
    created(){
        
        
    },
    data(){
        return {
            items:[]
        }
    },
    computed:{
        /**
         *  通过item收集 只保留 slot 的功能
         */
        btns(){
            return _.chain(this.panels)
                    .map(vnode => vnode.$attrs)
                    .value()
        }
    },
    methods:{
        click(item){
            item.onClick && item.onClick(this.scope,item)
        }
    }
}
</script>

<style scoped lang="sass">

</style>