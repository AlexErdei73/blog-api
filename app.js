var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var configAuth = require("./config/auth");
require("./config/database");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users")(passport); //We inject passport to the router module to protect some routes
var postsRouter = require("./routes/posts")(passport);
var blocksRouter = require("./routes/blocks")(passport);

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
app.use("/posts", postsRouter);
app.use("/posts/:id/blocks", blocksRouter);

//Handle 404 status
app.use((req, res, next) => {
  res
    .status(404)
    .json({ success: false, errors: [{ status: 404, message: "NOT FOUND" }] });
});

module.exports = app;
