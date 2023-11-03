//require the passport middleware
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

//passport supports both Session based and Token-base authentication
exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());