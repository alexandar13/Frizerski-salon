var Comment = require("../models/Comment");
var ProfilFrizer = require("../models/ProfilFrizer");

module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Morate biti prijavljeni za pristup!');
      res.redirect('/login');
    },
    isAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            if(req.user.type=="admin"){
                return next();
            }else {
                req.flash("error_msg", "Nemate pravo pristupa!");
                res.redirect('/frizeri');
            }
         }else{
        req.flash('error_msg', 'Morate biti prijavljeni za pristup!');
        res.redirect('/login');
        }
    },
    isAutorized: function(req, res, next){
      if(req.isAuthenticated()){
          ProfilFrizer.findById(req.params.pid, function(err, ProfilFrizer){
             if(ProfilFrizer.author.id.equals(req.user._id) || req.user.type=="admin"){
                 next();
             } else {
                 req.flash("error_msg", "Nemate pravo pristupa!");
                 res.redirect("/profil/" + req.params.id);
             }
          });
      } else {
          req.flash("error_msg", "Morate biti prijavljeni za pristup!");
          res.redirect("/login");
      }
  },
  checkUserComment: function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.cid, function(err, Comment){
           if(Comment.author.id.equals(req.user._id) || req.user.type=="admin"){
               next();
           } else {
               req.flash("error_msg", "Nemate pravo pristupa!");
               res.redirect("/profil/" + req.params.pid);
           }
        });
    } else {
        req.flash("error_msg", "Morate biti prijavljeni za pristup!");
        res.redirect("/login");
    }
} 
};
  