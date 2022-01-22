const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://Esteban:esteban3430184@bdcoder.xrdqp.mongodb.net/coder_esteban?retryWrites=true&w=majority')

mongoose.connection.on('open', () => {
    console.log('Base de datos en mongo Atlas, conectada')
})

mongoose.connection.on('error', (err) => {
    console.log('Error en la conexion', err)
})  