const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://Tiwi:esteban123@auth.i79k1.mongodb.net/coder_ecco?retryWrites=true&w=majority')

mongoose.connection.on('open', () => {
    console.log('Base de datos en mongo Atlas, conectada')
})

mongoose.connection.on('error', (err) => {
    console.log('Error en la conexion', err)
})  