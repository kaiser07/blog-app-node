const express = require('express')
const handlebars = require('express-handlebars');
const { Mongoose } = require('mongoose');
const path = require("path")
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require("passport")

require('./config/auth')(passport)
require("./models/Categoria")
require("./models/Postagem")

const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')

const usuarios = require('./routes/usuario')
const router = express.Router()

const admin = require('./routes/admin');
const porta = 3000;
const app = express()

//Sessao
app.use(session({
    secret: "chaveaqui",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Montando o Middleware
//declarando as variaveis locais
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error,msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})


app.use(express.urlencoded({extended: true}))
app.use(express.json())


//configurando templete engine Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main',
runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set('view engine', 'handlebars')



// Mongoose
mongoose.connect("mongodb://localhost/blogapp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
}).then(()=> {
    console.log("Banco conectado com sucesso")
}).catch((err)=> {
    console.log("Houve um erro ao tentar conectar ao banco. Erro: "+err)
})

/*EXEMPLO DE MIDDLEWARE
app.use((rew, res, next) =>{
    //executa o que tem aqui e depois o que estiver em next()
    console.log("Middleware"),
    next()
})*/


//usar pasta Public do bootstrap
app.use(express.static(path.join(__dirname,"public")))

//Rotas
//Rota principal
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar as postagens")
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem})
        }else{
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro Interno")
        res.redirect("/")
    })
})


app.get("/404", (req, res) => {
    res.send("Erro 404!")
})

app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias)=> {
        res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar as categorias")
        res.redirect("/")
    })
})


app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts desta categoria")
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro acessar esta página das categorias")
        res.redirect("/")
    })
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)






app.listen(process.env.PORT || porta, () => {
    console.log(`Servidor ligado em localhost:${porta}`)
})