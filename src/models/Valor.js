const {Schema, model} = require('mongoose')

const valorSchema = new Schema({
    valor: {
        type: String
    }
})

module.exports = model("valor", valorSchema)