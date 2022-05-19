<template lang="pug">
el-table.y-el-table.y-mt-sm.common-table(ref="multipleTable", row-key="_id", :data="dataSource", v-loading="tableloading")
    
    el-table-column(:label="$t('xxx.rule_desc')", prop="rule_desc", min-width="200px")
        template(slot-scope="scope")
            span(v-html="scope.row.rule_desc")
    
    el-table-column(:label="$t('xxx.evaluative_dimension')", prop="evaluate_dimension", min-width="160px")
    
    //- el-table-column(:label="$t('xxx.quality_control_datasource')", prop="quality_control_data_source", min-width="160px")
    
    el-table-column(:label="$t('xxx.rule_source')", prop="rule_source", min-width="160px")
    
    el-table-column(:label="$t('xxx.category')", prop="soar_cate", min-width="160px")
        template(slot-scope="scope")
            span.rule-cate-text(v-for="(item, index) in scope.row.soar_cate") {{item}}
                span(style="padding-right: 4px",v-if="index !== scope.row.soar_cate.length - 1") ;
    
    el-table-column(:label="$t('xxx.rule_field')", prop="field_name_list", min-width="160px")
        template(slot-scope="scope")
            .rule-field-text(v-for="item in scope.row.field_name_list") {{item}}
    
    el-table-column(:label="$t('xxx.pass_ratio')", prop="ratio", min-width="180px")
        template(slot-scope="scope") {{ scope.row.ratio | toPercent(2, false, '-')}}
.y-clearfix.y-mt.y-mb.y-mr.y-ml
    .y-pull-right
        el-pagination(background, @current-change="handleCurrentChange", :current-page.sync="pageNum", :page-size="pageSize",  :total="total", layout="prev, pager, next, jumper")
</template>