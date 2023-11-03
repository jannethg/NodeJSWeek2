var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

var logger = require("morgan");
//import the express session module and session-file-store
// const Filestore calls to function Session-file-store and Session
// Argument is returning another function as its return value then immediately calling that function with the second parameter list of (Session)
const session = require('express-session');
const FileStore = require('session-file-store')(session);

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
//we won't use a cookie parser since the Express session has its own cookies
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  //new session is created but no updates are made to it, 
  //then at the end of the request it won't get saved because it will just be an empty session.
  saveUninitialized: false,   
  // once the session has been create it will keep the session saved even if that session didn't make any updates.
  //this will keep the session marked as active so it doesn't get deleted by the user still making requests.
  resave: false, 
  //this will create a new Filestore as an object that we can use to save our session info to the server's hard disk instead of just in running application memory
  store: new FileStore()

}));

function auth(req, res, next) {
  console.log(req.session);
  //replace the signedCookies with session since we don't use the parser anymore.
  if (!req.session.user) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }

      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const user = auth[0];
      const pass = auth[1];
      if (user === 'admin' && pass === 'password') {
          //res.cookie('user', 'admin', {signed: true});  
          //req.session will be handle by Express session middleware 
          req.session.user ='admin';
          return next(); // authorized
      } else {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }
  } else {
      if (req.session.user === 'admin') { //replace signedCookies with session with will be handle by Express session middleware 
          return next();
      } else {
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



