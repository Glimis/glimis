// const {createProxyMiddleware} = require('http-proxy-middleware');
const express = require('express')
const path = require('path')
const _ = require('lodash')
/**
 * proxy代理
 * 
 * @param {*} app 
 */
 module.exports = (app)=>{
    
    app.use('/mock/data.json',(req,res)=>{
        res.json({
            "data":{
                "data":[{
                    "key":Math.random(),
                    "value":"文案1"
                },{
                    "key":Math.random(),
                    "value":"文案2"
                }],
                "page_size":10,
                "total_count":Number.parseInt(Math.random()*1000) + 100,
                "page_no": Number.parseInt(Math.random()*10) + 1
            }
        })
    }); 
    app.use('/mock/model.json',(req,res)=>{
        res.json({
            "data":{
                "data":{
                    "name":"张三",
                    "age":Math.random()
                }
            }
        })
    }); 

    app.use('/mock/progress.json',(req,res)=>{
        res.json({
            "data":{
                "data":{
                    "num": Math.random()
                }
            }
        })
    }); 



    app.use('/mock',express.static(path.resolve(__dirname,'../mock'))); 
    // app.use('/mock',_.debounce(express.static(path.resolve(__dirname,'../mock')),1000)); 
}