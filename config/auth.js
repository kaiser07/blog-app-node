const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//model do usuario
require('../models/Usuario')
const Usuario = mongoose.model("usuarios")

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField:"senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message:"Esta conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, ok) => {
                if(ok){
                    return done(null, usuario)
                    
                } else {
                    return done(null, false, {message: "Senha incorreta"})
                }
        })
    })
}))


//funções para salvar os dados do usuário na sessão
passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
})

passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
        done(err, usuario)
    })
})

}