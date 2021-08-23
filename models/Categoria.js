const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        require: true
        //defaul: "Valor padrão caso quisesse"
    },
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("categorias", Categoria)