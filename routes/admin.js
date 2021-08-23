const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')

const {eAdmin} = require("../helpers/eAdmin")

const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")


router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Página de Post's")
})

router.get('/categorias', eAdmin, (req, res) => {
    // para ordenar os resultados do mongo
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", 'Houve um erro ao listar as categorias')
        res.req('/admin')
    })

})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.get('/teste', (req, res) => {
    res.send("Página de Categorias")
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno" })
    }

    if (req.body.slug.length < 2) {
        erros.push({ texto: "Slug da categoria é muito pequeno" })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente")
            console.log("Erro ao tentar adicionar a categoria. Erro: " + err)
        })
    }
})

//rota que "entra" na categoria desejada já com os valores do banco para possivel edição 
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta Categoria não existe")
        res.redirect("/admin/categorias")
    })
})

//Rota que insere a edição da categoria no mongo ##FALTA VALIDAÇÃO DOS DADOS
router.post('/categorias/edit', eAdmin, (req, res) => {
    //faço a busca por id no model, e adiciono as alterações antes de tentar salvar a edição no banco
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome,
            categoria.slug = req.body.slug

        //tenta salvar a edição da collection no banco
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno ao salvar a edição da categoria")
            res.redirect('/admin/categorias')
        })

    }).catch((err) => {
        req.flash('error_msg', "Não foi possível editar a categoria")
        res.redirect('/admin/categorias')
    })
})

//Rota para deletar 
router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno e não foi possível deletar a categoria!")
        res.redirect('/admin/categorias')

    })
})

//Rota de listagem de todas as postagens
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})

//rota do formulário de postagens
router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulário")
        res.redirect("/admin")
    })

})

//rota para adicionar as postagens ao banco de dados ##FALTA VALIDAÇÃO DOS DADOS
//posso colocar required nos inputs do html para ajudar
router.post("/postagens/nova", (req, res) => {

    var erros = []
    //adiciona o erro no arrey
    if (req.body.categoria == '0') {
        erros.push({ texto: "Categoria inválida, registre uma categoria" })
    }
    //validação se há erros no array
    if (erros.length > 0) {
        res.render("admin/addpostagens", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante a tentativa de salvar a postagem")
            res.redirect("/admin/postagens")
        })
    }
})

//rota de edição
router.get('/postagens/edit/:id/', eAdmin, (req, res) => {
    //busca as postagens
    Postagem.findOne({_id: req.params.id}).populate("categoria").then((postagem) => {
        Categoria.find({_id: {$ne: postagem.categoria._id}}).lean().sort({nome: 'asc'}).then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
        
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o form de edição")
        res.redirect("/admin/postagens")
    })
})

//rota que altera no banco a edição ##PRECISA DE VALIDAÇÃO AINDA
router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria,
    
        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect('/admin/postagens')

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})


//Rota para excluir a postagem
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Mensagem excluída com sucesso")
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível excluir a postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router