const passport = require('passport');
const User = require('./models/user');

//use for username and password, hashing, salting, etc.
const LocalStrategy = require('passport-local').Strategy;

//Passwort jwt strategy is used for token authentication
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

const FacebookTokenStrategy = require('passport-facebook-token');

//Passport jwt strategy is used for token authentication -  is all middleware 
//configure for the Passport local strategy
exports.local = passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());  //when user login, it stores the session
passport.deserializeUser(User.deserializeUser());  //when  user logs out, we can destroy session


exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

//Configure JWT Strategy
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

//its going to decode the payload with the _id
// Configuring passport with JWT Strategy
const nucampJwtStrategy = new JwtStrategy(opts, (jwt_payload, done) => {
    if (process.env.NODE_ENV !== "test") {
      console.log("JWT payload:", jwt_payload);
    }
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) return done(err, false);
      if (user) return done(null, user);
      return done(null, false);
    });
  });
  
  exports.jwtPassport = passport.use(nucampJwtStrategy);
  
  exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) return next();
    const err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  };
  
  exports.verifyUser = passport.authenticate("jwt", { session: false });

  exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);
  