

const data = {

}

export function register(name,clazz){
    data[name] = clazz
}

export function getClazz(name){
    
   return data[name]
}

