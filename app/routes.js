module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      // find user by ID, using ID value
        db.collection('demo').find({name: req.user.local.email}).toArray((err, result) => {

          if (err) return console.log(err)
          
          res.render('profile.ejs', {
            user : req.user,
            list: result
          })
        })
    });


    app.get('/convert', isLoggedIn, function(req, res) {
      res.render('convert.ejs', {
          user : req.user
      })
    });


    // have same app.get for other pages

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('demo').insertOne(
        {
        name: req.body.name,
      },
    (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile');
      });
    })

    // 11/4, 1:21PM, tested logic below. 
    // green checkbox tested and it does not return false when clicked after it returns true. (you can't uncheck)

    app.put('/messages', (req, res) => {
      console.log(req.body)
      db.collection('demo').findOneAndUpdate(
        {
          name: req.body.name, 
          msg: req.body.msg,
        },

        {
          // $set explanation
        $set: {
          checkBox: !req.body.checkBox,
        },
      }, 
      {
        sort: {_id: -1},
        upsert: true
      }, 
      (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      }
    )
  })

    app.delete('/messages', (req, res) => {
      db.collection('demo').findOneAndDelete({
        name: req.body.name, 
        msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        console.log('deleted')
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
