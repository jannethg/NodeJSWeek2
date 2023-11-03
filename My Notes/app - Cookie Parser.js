var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");


var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");


const mongoose = require ('mongoose');
//const url = 'mongodb://127.0.0.1:27017/nucampsite';

const url = "mongodb+srv://jgutier1:DX4tkkeH7Kg36iTu@nucampcluster10282023.pdde700.mongodb.net/?retryWrites=true&w=majority"



const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  () => console.log("Connected correctly to MongoDB actual server"),
  (err) => console.log(err) // alt. to catch method
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//provide cookie secret key with a string
app.use(cookieParser('12345-67890-09876-54321'));

function auth(req,res,next) {
  // Cookie parser: checks if cookie is properly signed
  if (!req.signedCookies.user) {  
  
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        const err = new Error('You are not authenticated');
        res.setHeader('WWW-Authenticate', 'Basic');  
        err.status = 401;
        return next(err);
    }
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');    
      const user = auth[0];
      const pass = auth[1];    
      if (user === 'admin' && pass === 'password') {
          //Express response object API:  
          //First Argument:  setup a property of user on the sign cookie object
          //second argument: will be a value to store in the name property with string of "admin"
          //Third arg:  is optional and an object that contains configuration values, 
          //  we'll let Express know to use the secret key from cookie parser to create a signed cookie
          //res.cookie method handles creating the cookie and setting it up in the server's response to the client
          res.cookie('user', 'admin', {signed: true});
          return next(); // authorized or access granted
      } else {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');      
          err.status = 401;
          return next(err);
      }
  } else {  //cookie else if there is a signed cookie user value in incoming request
    //we'll check to see if value ="admin", if so we'll grant access by passing the client on to the next middleware function using next();
    if (req.signedCookies.user ==='admin') {
      return next();
    } else {  //otherwise we'll send an error response of '401'
      const err = new Error('You are not authenticated!');        
      err.status = 401;
      return next(err);
    }
  }
}
app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;



