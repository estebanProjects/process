const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://Esteban:esteban3430184@ecommerceback.of4my.mongodb.net/coder_ecco?retryWrites=true&w=majority')

mongoose.connection.on('open', () => {
    console.log('Base de datos en mongo Atlas, conectada')
})

mongoose.connection.on('error', (err) => {
    console.log('Error en la conexion', err)
})  