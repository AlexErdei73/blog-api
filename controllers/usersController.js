const bcrypt = require("bcryptjs");
require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = "1d";

  payload = {
    sub: _id,
    iat: Math.floor(new Date() / 1000),
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.SECRET, {
    expiresIn: expiresIn,
  });

  return {
    token: "bearer " + signedToken,
    expires: expiresIn,
  };
}

// Create new user in the database
exports.users_post = function (req, res, next) {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      const err = new Error("Username already used");
      return res.status(409).json({ success: false, msg: err.message });
    } else
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return next(err);
        }
        const newUser = new User({
          username: req.body.username,
          hash: hash,
          isAdmin: false,
        });
        newUser.save((err, user) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json({ success: true, user: user });
        });
      });
  });
};

// Login user
exports.users_login_post = function (req, res, next) {
  User.findOne({ username: req.body.username }).exec((err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Username not found" });
    } else {
      bcrypt.compare(req.body.password, user.hash, (err, result) => {
        if (err) {
          return next(err);
        }
        if (!result) {
          return res
            .status(401)
            .json({ success: false, msg: "Invalid password" });
        } else {
          // successful authentication, we issue the JWT
          const jwt = issueJWT(user);
          return res.status(200).json({
            success: true,
            user: user,
            token: jwt.token,
            expiresIn: jwt.expires,
          });
        }
      });
    }
  });
};
