var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var configAuth = require("./config/auth");
require("./config/database");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users")(passport); //We inject passport to the router module to protect some routes

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

configAuth(passport);
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
