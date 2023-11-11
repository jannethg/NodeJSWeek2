const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../authenticate");
const { verifyUser, verifyAdmin } = authenticate;
const cors = require('./cors');

const userRouter = express.Router();

/* GET users listing. */
userRouter.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .then(users => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(users);
    })
    .catch(err => next(err));
  
});

userRouter.post("/signup", cors.corsWithOptions, (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            console.log(req);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

const authenticationError = (req, res, next) => {
  const err = new Error("You are not authenticated!");
  res.setHeader("WWW-Authenticate", "Basic");
  err.status = 401;
  return next(err);
};

userRouter.post("/login", cors.corsWithOptions, passport.authenticate("local"), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token: token,
    status: "You are succssfully logged in!",
  });
});

userRouter.get("/logout", cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  if (req.user) {
    req.logout();
    res.redirect("/");
  } else {
    const err = new Error("You are not logged in!");
    err.status = 401;
    return next(err);
  }
});

module.exports = userRouter;
