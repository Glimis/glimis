 /**
* 基础代理 + 读写器
* 
* 用于统一api，包括
* 
* 1. Memory
* 2. localStorage
* 3. ajax
* 4. jsonp
* 5. session
* 6. sql
* 7. buffere
* ....
* 
* 包含两部信息
* 
* 1. 增删改查 【请求】
* 2. 读写器 【修正req,res】
*/
export default class AProxy {
    // 增删改查行为
    create (){}
    read(){}
    update (){}
    erase (){}
 
    // 读写器 --> 不同格式的抽象
    getReader(res){
       return res 
    }
    getWriter(req){
       return req
    }
 }