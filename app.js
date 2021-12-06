const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var ProfilFrizer = require('./models/ProfilFrizer');
var Comment = require('./models/Comment');
var Usluga = require('./models/Usluga');
var Frizura = require('./models/Frizura');
var Termin = require('./models/Termin');
var Dan = require('./models/Dan');
methodOverride = require("method-override");

const {isAdmin, ensureAuthenticated, isAutorized, checkUserComment} = require('./config/auth');

const app = express();

const db = require('./config/keys').mongoURI;

app.set('view engine', 'ejs');

require('./config/passport')(passport);

app.use(express.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

app.use(methodOverride('_method'));

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log("MongoDB connected..")).catch((er) => console.log(er));

app.use(session({secret: 'secret', resave: true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
});

app.get('/', (req, res) => {
    res.render("home.ejs", {
        currentUser: req.user
    })
});

app.get('/register', (req, res) => {
    res.render("register.ejs", {
        currentUser: req.user
    })
});

app.get('/register_frizer', isAdmin, (req, res) => {
    res.render("register_frizer.ejs", {
        currentUser: req.user
    })
});

app.get('/login', (req, res) => {
    res.render("login.ejs", {
        currentUser: req.user
    })
});

app.get('/frizeri', (req, res) => {
    ProfilFrizer.find({}, function (err, sviProfili) {
        if (err) {
            console.log(err);
        } else {
            res.render("frizeri.ejs", {
                profili: sviProfili,
                currentUser: req.user
            });
        }
    })
});

app.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({msg: 'Popunite sva polja'});
    }

    if (password != password2) {
        errors.push({msg: 'Lozinke se ne poklapaju'});
    }

    if (password.length < 6) {
        errors.push({msg: 'Lozinka mora da ima bar 6 karaktera'});
    }

    if (errors.length > 0) {
        res.render("register.ejs", {
            errors,
            name,
            email,
            password,
            password2,
            currentUser: req.user
        });
    } else {
        User.findOne({email: email}).then(user => {
            if (user) {
                errors.push({msg: 'Email već postoji'});
                res.render("register.ejs", {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    currentUser: req.user
                });
            } else {
                const newUser = new User({name, email, password});

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) 
                            throw err;
                        
                        newUser.password = hash;
                        newUser.save().then(user => {
                            req.flash('success_msg', 'Registrovani ste i možete se prijaviti');
                            res.redirect('/login');
                        }).catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

app.post('/register_frizer', (req, res) => {
    const {
        name,
        email,
        password,
        password2,
        slika,
        opis
    } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2 || !slika || !opis) {
        errors.push({msg: 'Popunite sva polja'});
    }

    if (password != password2) {
        errors.push({msg: 'Lozinke se ne poklapaju'});
    }

    if (password.length < 6) {
        errors.push({msg: 'Lozinka mora da ima bar 6 karaktera'});
    }

    if (errors.length > 0) {
        res.render("register_frizer.ejs", {
            errors,
            name,
            email,
            password,
            password2,
            slika,
            opis,
            currentUser: req.user
        });
    } else {
        User.findOne({email: email}).then(user => {
            if (user) {
                errors.push({msg: 'Email već postoji'});
                res.render("register_frizer.ejs", {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    slika,
                    opis,
                    currentUser: req.user
                });
            } else {
                const newUser = new User({name, email, password});

                const newProfil = new ProfilFrizer({
                    name,
                    "author": {
                        "id": newUser._id
                    },
                    "image": slika,
                    "description": opis,
                    "radnoVreme": 8
                });

                for (var k = 0; k < 31; k++) {
                    const newDan = new Dan();
                    for (var t = 0; t < 8; t++) {
                        const newTermin = new Termin({"tip": "slobodan"});
                        newTermin.save();
                        newDan.termini.push(newTermin);
                    }
                    newDan.save();
                    newProfil.dani.push(newDan);
                    /*Dan.create(req.body, function(err, dan){
                                if(err){
                                    console.log(err);
                                }else{
                                    for(var t=0; t<8; t++){
                                        Termin.create(req.body, function(err, termin){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                termin.tip="slobodan";                                               
                                                termin.save();
                                                dan.termini.push(termin._id);
                                            }
                                        })
                                    }
                                    dan.save();
                                    newProfil.dani.push(dan._id);    
                                    
                                }
                            })*/
                }

                newProfil.save();
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) 
                            throw err;

                        newUser.password = hash;
                        newUser.type = "frizer";
                        newUser.save().then(user => {
                            req.flash('success_msg', 'Novi frizer je registrovan');
                            res.redirect('/register_frizer');
                        }).catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Odjavljeni ste');
    res.redirect('/login');
});

app.get('/frizeri/:id', (req, res) => {
    ProfilFrizer.findById(req.params.id).populate("comments").populate("usluge").populate("frizure").exec(function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            var moment = require('moment');
            res.render("profil.ejs", {
                currentUser: req.user,
                profil: profil,
                moment: moment
            })
        }
    });
});

app.delete("/delete/:pid", isAutorized, function (req, res) {
    ProfilFrizer.findByIdAndRemove(req.params.pid, function (err, profil) {
        Comment.remove({
            _id: {
                $in: profil.comments
            }
        }, function (err, comments) {
            User.findByIdAndDelete(profil.author.id, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('error_msg', 'Profil frizera ' + profil.name + ' je obrisan!');
                    res.redirect('/frizeri');
                }
            })
        })
    });
});

app.get("/edit/:pid", isAutorized, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            User.findById(profil.author.id, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("edit_profil.ejs", {
                        currentUser: req.user,
                        profil: profil,
                        user: user
                    })
                }
            })
        }
    });
});

app.post("/edit/:pid", isAutorized, function (req, res) {
    ProfilFrizer.findByIdAndUpdate(req.params.pid, req.body, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            User.findById(profil.author.id, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    user.email = req.body.email;
                    user.save();
                    req.flash('success_msg', 'Podaci o frizeru ' + profil.name + ' su izmenjeni!');
                    res.redirect('/frizeri');
                }
            });
        }
    });
});

app.get("/frizeri/:pid/comments/new", ensureAuthenticated, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            res.render("new_comment.ejs", {
                currentUser: req.user,
                profil: profil
            });
        }
    });
});

app.post("/frizeri/:pid/comments", ensureAuthenticated, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
            res.redirect('/frizeri/' + profil._id);
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.name;
                    comment.text = req.body.text;
                    comment.save();
                    profil.comments.push(comment);
                    profil.save();
                    req.flash('success_msg', 'Komentar je sačuvan!');
                    res.redirect('/frizeri/' + profil._id);
                }
            });
        }
    });
});

app.get("/frizeri/:pid/comments/:cid/edit", checkUserComment, function (req, res) {
    Comment.findById(req.params.cid, function (err, comment) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit_comment.ejs", {
                currentUser: req.user,
                profil_id: req.params.pid,
                comment: comment
            });
        }
    });
});

app.post("/frizeri/:pid/comments/:cid/edit", checkUserComment, function (req, res) {
    Comment.findByIdAndUpdate(req.params.cid, req.body, function (err, comment) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', 'Komentar je izmenjen!');
            res.redirect('/frizeri/' + req.params.pid);
        }
    });
});

app.delete("/frizeri/:pid/comments/:cid/delete", checkUserComment, function (req, res) {
    Comment.findByIdAndDelete(req.params.cid, function (err, comment) {
        if (err) {
            console.log(err);
        } else {
            ProfilFrizer.findByIdAndUpdate(req.params.pid, {
                $pull: {
                    comments: comment.id
                }
            }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    req.flash('error_msg', 'Komentar je obrisan!');
                    res.redirect('/frizeri/' + req.params.pid);
                }
            });
        }
    });
});

app.get("/frizeri/:pid/usluga/new", isAutorized, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            res.render("new_usluga.ejs", {
                currentUser: req.user,
                profil: profil
            });
        }
    });
});

app.post("/frizeri/:pid/usluga/new", isAutorized, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
            res.redirect('/frizeri/' + profil._id);
        } else {
            Usluga.create(req.body, function (err, usluga) {
                if (err) {
                    console.log(err);
                } else {
                    usluga.trajanje = req.body.vreme;
                    usluga.save();
                    profil.usluge.push(usluga);
                    profil.save();
                    req.flash('success_msg', 'Usluga je sačuvana!');
                    res.redirect('/frizeri/' + profil._id);
                }
            })
        }
    });
});

app.get("/frizeri/:pid/usluga/:uid/edit", isAutorized, function (req, res) {
    Usluga.findById(req.params.uid, function (err, usluga) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit_usluga.ejs", {
                currentUser: req.user,
                profil_id: req.params.pid,
                usluga: usluga
            });
        }
    });
});

app.post("/frizeri/:pid/usluga/:uid/edit", isAutorized, function (req, res) {
    Usluga.findByIdAndUpdate(req.params.uid, req.body, function (err, usluga) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', 'Usluga je izmenjena!');
            res.redirect('/frizeri/' + req.params.pid);
        }
    });
});

app.delete("/frizeri/:pid/usluga/:uid/delete", isAutorized, function (req, res) {
    Usluga.findByIdAndDelete(req.params.uid, function (err, usluga) {
        if (err) {
            console.log(err);
        } else {
            ProfilFrizer.findByIdAndUpdate(req.params.pid, {
                $pull: {
                    usluge: usluga.id
                }
            }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    req.flash('error_msg', 'Usluga je obrisana!');
                    res.redirect('/frizeri/' + req.params.pid);
                }
            });
        }
    });
});

app.post("/frizeri/:pid/oceni", ensureAuthenticated, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            if (req.body.ocena == null) {
                req.flash('error_msg', 'Morate da selektujete jednu ocenu!');
                res.redirect('/frizeri/' + req.params.pid);
            } else {
                profil.ocene.push(req.body.ocena);
                var i = 0;
                profil.ocene.forEach(function (ocena) {
                    i = i + ocena;
                });
                profil.prosecna_ocena = i / (profil.ocene.length);
                profil.save();
                req.flash('success_msg', 'Ocena je sačuvana!');
                res.redirect('/frizeri/' + req.params.pid);
            }
        }
    })
});

app.get("/frizeri/ocena/najveca_prvo", (req, res) => {
    ProfilFrizer.find().sort({prosecna_ocena: -1}).exec(function (err, sviProfili) {
        if (err) {
            console.log(err);
        } else {
            res.render("frizeri.ejs", {
                profili: sviProfili,
                currentUser: req.user
            });
        }
    });
});

app.get("/frizeri/ocena/najmanja_prvo", (req, res) => {
    ProfilFrizer.find().sort({prosecna_ocena: 1}).exec(function (err, sviProfili) {
        if (err) {
            console.log(err);
        } else {
            res.render("frizeri.ejs", {
                profili: sviProfili,
                currentUser: req.user
            });
        }
    });
});

app.get("/frizeri/:pid/frizura/new", isAutorized, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            res.render("new_frizura.ejs", {
                currentUser: req.user,
                profil: profil
            });
        }
    });
});

app.post("/frizeri/:pid/frizura/new", isAutorized, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
            res.redirect('/frizeri/' + profil._id);
        } else {
            Frizura.create(req.body, function (err, frizura) {
                if (err) {
                    console.log(err);
                } else {
                    profil.frizure.push(frizura);
                    profil.save();
                    req.flash('success_msg', 'Frizura je sačuvana!');
                    res.redirect('/frizeri/' + profil._id);
                }
            })
        }
    });
});

app.get("/frizeri/:pid/frizura/:fid/edit", isAutorized, function (req, res) {
    Frizura.findById(req.params.fid, function (err, frizura) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit_frizura.ejs", {
                currentUser: req.user,
                profil_id: req.params.pid,
                frizura: frizura
            });
        }
    });
});

app.post("/frizeri/:pid/frizura/:fid/edit", isAutorized, function (req, res) {
    Frizura.findByIdAndUpdate(req.params.fid, req.body, function (err, frizura) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', 'Frizura je izmenjena!');
            res.redirect('/frizeri/' + req.params.pid);
        }
    });
});

app.delete("/frizeri/:pid/frizura/:fid/delete", isAutorized, function (req, res) {
    Frizura.findByIdAndDelete(req.params.fid, function (err, frizura) {
        if (err) {
            console.log(err);
        } else {
            ProfilFrizer.findByIdAndUpdate(req.params.pid, {
                $pull: {
                    frizure: frizura.id
                }
            }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    req.flash('error_msg', 'Frizura je obrisana!');
                    res.redirect('/frizeri/' + req.params.pid);
                }
            });
        }
    });
});

app.get("/:pid/termin", ensureAuthenticated, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            res.render("calendar.ejs", {
                currentUser: req.user,
                profil: profil
            })
        }
    })
})

app.get("/frizeri/:pid/termin/:did", ensureAuthenticated, function (req, res) {
    ProfilFrizer.findById(req.params.pid, function (err, profil) {
        if (err) {
            console.log(err);
        } else {
            Dan.findById(req.params.did).populate("termini").exec(function (err, dan) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("termini.ejs", {
                        currentUser: req.user,
                        profil: profil,
                        dan: dan
                    })
                }
            })
        }
    })
})

app.get("/frizeri/:pid/termin/:did/:tid/zakazi", ensureAuthenticated, function (req, res) {
    Termin.findById(req.params.tid, function (err, termin) {
        if (err) {
            console.log(err);
        } else {
            termin.tip = "zauzet";
            termin.ime = req.user.name;
            termin.save();
            req.flash("success_msg", "Uspešno ste zakazali termin!");
            res.redirect("/frizeri/" + req.params.pid + "/termin/" + req.params.did);
        }
    })
})

app.get("/frizeri/:pid/termin/:did/:tid/otkazi", ensureAuthenticated, function (req, res) {
    Termin.findById(req.params.tid, function (err, termin) {
        if (err) {
            console.log(err);
        } else {
            termin.tip = "slobodan";
            termin.ime = null;
            termin.save();
            req.flash("success_msg", "Uspešno ste otkazali termin!");
            res.redirect("/frizeri/" + req.params.pid + "/termin/" + req.params.did);
        }
    })
})

const PORT = 3000;
const server = app.listen(PORT, console.log(`Server is listening on port ${PORT}`));
