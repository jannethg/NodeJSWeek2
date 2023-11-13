var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
const config = require("./config");
const passport = require("passport");

const mongoose = require("mongoose");
//const url = 'mongodb://127.0.0.1:27017/nucampsite';
//const url = "mongodb+srv://jgutier1:DX4tkkeH7Kg36iTu@nucampcluster10282023.pdde700.mongodb.net/?retryWrites=true&w=majority"
const url = config.mongoUrl;

const uploadRouter = require('./routes/uploadRouter');

const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  () => {
    console.log("Connected correctly to server");
  },
  (err) => console.log(err)
);

var app = express();
// '*' catch every single request in the server and Secure traffic ONLY
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

//to check if there's an existing session for that client, then if so the session client is loaded into the request as rec.user
app.use(passport.initialize());
//app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const partnerRouter = require("./routes/partnerRouter");
const promotionRouter = require("./routes/promotionRouter");
const favoriteRouter = require("./routes/favoriRouter");

app.use("/campsites", campsiteRouter);
app.use("/partners", partnerRouter);
app.use("/promotions", promotionRouter);
app.use("/favorites", favoriteRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/imageUpload", uploadRouter);

app.get("/corsexample", (req, res) => {
  res.json("this is from the backend server for CORS example!!");
});


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
