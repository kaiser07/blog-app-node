
module.exports = {
    
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin ==1){
            return next()
        }
        req.flash("error_msg", "Apenas administradores podem entrar aqui")
        res.redirect("/")
     
    }
}
    /*eUsuario: function(req, res, next) {
        if(req.isAuthenticated()){
            return next()
        }

        req.flash("error_msg", "Você deve estar logado para entrar aqui")
        res.redirect("/")
    }*/

