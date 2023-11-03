var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

var logger = require("morgan");

const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

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


app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',  
  saveUninitialized: false,     
  resave: false,   
  store: new FileStore()

}));

//to check if there's an existing session for that client, then if so the session client is loaded into the request as rec.user
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);


function auth(req, res, next) {
  console.log(req.user);
  // if there is no req user, then we know there is no session loaded for this client
  if (!req.user) {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
  } else {
      return next(); //pass to the next middleware    
  }
}
app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {  
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;



