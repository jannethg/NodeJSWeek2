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
app.use(cookieParser());

//Authentication Middleware, users authenticate before they access to the server.
//must have request and response as parameters (req, res)
// if !authHeader -means the user did not enter a username and password yet
function auth(req,res,next) {
  console.log(req.headers);
  const authHeader = req.headers.authorization;
  if(!authHeader) {
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');  // this lets the client know that the server is requesting authentication
      err.status = 401;
      return next(err);
  }
    //Buffer global class in Node, from is a static method of buffer, the split and to method belong to vanilla javascript, not node
    //this will take the username /pwd from the header and it will extract the
    //authentication from it and put them both into the auth array as the first and second items. 
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    //this will grab the username and password from auth array
    const user = auth[0];
    const pass = auth[1];
    // simple if check if user= 'admin' and password = password
    if (user === 'admin' && pass === 'password') {
        return next(); // authorized or access granted
    } else {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        return next(err);
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



