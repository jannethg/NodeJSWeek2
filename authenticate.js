//require the passport middleware
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

//import the JWT Strategy constructor from the Passport Jwt library
//we'll require another module from passport.jwt called extract jwt
//helper methods will use to extract the jw token from a request object
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//import the JSOn webtoken module which we'll use to create sign and verify tokens
const jwt = require('jsonwebtoken');

//we need to import the config.js file that we just created.
const config = require('./config.js');


//passport supports both Session based and Token-base authentication
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//export the get token which will be a function that receives an object that we'll call user.
//this user object will contain an id for a user document 
// we return a token created by this jwt.sign method w/c is a part of the web token API
exports.getToken = user => {
    // we'll take the user object that passed in as the first argument, 
    //second arg will be the secret key string from the conflig module we just created.
    // we'll supply an additional argument here that will expire in 3600 seconds which is an hour that will be long enough to allow us to test our server
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

//contain the options for the jwt strategy, we'll initialize as an empty object {}.
//this option specifies how the json web token should be extracted from the incoming request message.
// A json web token can be sent from the client, it can be sent as a request header, sent body or even as a url query parameter
//this option will set the method in which the server expects the token to be sent 
// we're saying please send it to us in an authorization header and as a Bearer token
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//this option lets us supply the jwt strategy with the key with which we'll assign as token
// and reset that to the config secret key property we set up earlier in config.js
opts.secretOrKey = config.secretKey;

//export the jwt strategy as passport and assign to the passwport.use method w/c takes an instance of the jwt strategy as an argument
// we'll create that here using jwt strategy constructor with newJwtStrategy with 2 arguments;
// first one: object with configurations options (opts)
//second one: a verify callback function 
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload', jwt_payload);
            User.findOne({_id: jwt_payload_id}, (err, user) => {
                if (err) {
                    return done(err, false);                    
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false); //no error and false for no user was found.
                }
            });
        }

    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});