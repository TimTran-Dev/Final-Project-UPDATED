const ObjectId = require("mongodb").ObjectId;


module.exports = function(app, passport, db, mongoose) {


    app.get('/', function(req, res) {
        res.render('index.ejs');
    });
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('schools').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            userInfo: result
          })
        })
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.post('/profile', (req, res) => {
      console.table(req.body)
      db.collection('schools').save({photo: req.body.img, name: req.body.name, school: req.body.school}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })


    app.put("/profile", (req, res) => {
    console.log(`${req.body._id}`);
    console.log(ObjectId(req.body._id));
    console.table(req.body);
    db.collection("schools").findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      {
        $set: {
          school: req.body.school
        }
      },
      { new: true, upsert: true},
      (err, result) => {
        if (err) {
          console.log("err", err);
          return res.send(err);
        }
        console.log("res", result);
        res.send(result);
      }
    );
  });



    app.delete("/profile", (req, res) => {
        console.log(req.body);
        db.collection("schools").findOneAndDelete(
          {name: req.body.name, school: req.body.school },
          (err, result) => {
            if (err) return res.send(500, err);
            res.send("Message deleted!");
          }
        );
      });
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
        }));
        app.get('/signUp', function(req, res) {
            res.render('signUp.ejs', { message: req.flash('signupMessage') });
        });

        app.get('/School', function(req, res) {
            res.render('School.ejs', { message: req.flash('signupMessage') });
        });


        app.post('/signUp', passport.authenticate('local-signup', {
            successRedirect : '/profile',
            failureRedirect : '/signUp',
            failureFlash : true
        }));
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
