const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        //relacionando 2 documentos do mongo, aqui armazenando o id dascategorias no caso
        type: Schema.Types.ObjectId,
        //nome do model que havia sido criado
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

//model definido
mongoose.model("postagens", Postagem)
