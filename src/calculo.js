require('./db_users')
const Valor = require('./models/Valor')

const getValor = async() => {
    const valr = await Valor.find()
    return valr[valr.length-1].valor
}

const calculo = async() => {
    let cant = await getValor()

    let array = []
    let obj = []
    if(cant == undefined) {
        cant = 100000
    }

    for(let i=0; i < cant; i++) {
        let random = Math.floor(Math.random()*1000)
        array.push(random)
    }
    
    while(array.length != 0) {
        let contador = 1
        for(let j=1; j<array.length; j++) {
            if(array[0] == array[j]) {
                contador++                
                array.splice(j, 1)
            }
        }
        obj.push({numero: array[0],repetido: contador})
        array.splice(0, 1)
    }
    return obj
}

process.on('message', async(message) => {
    if(message === "start") {
        let object = await calculo()
        process.send(object)
    } else {
        console.log('No se inicio la funcion')
    }
})