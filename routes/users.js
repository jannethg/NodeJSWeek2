const express = require('express');
const User = require('../models/user');

const router = express.Router();

const passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//Checking if user exist: then we create the username and password
// New user that we create with a name that was given to us from the client
router.post('/signup', (req, res) => {
  User.register(
      new User({username: req.body.username}),
      req.body.password,
      err => {
          if (err) {
              res.statusCode = 500; //internal issue error
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
          } else {   //authenticate the newly registered user
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'});
              });
          }
      }
  );
});


router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});


router.get('/logout', (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;
