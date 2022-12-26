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

// Respond with the list of existing users
exports.users_get = function (req, res, next) {
  User.find({})
    .select("-hash")
    .exec((err, users) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(users);
    });
};

// Create new user in the database
exports.users_post = function (req, res, next) {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      const err = new Error("Username already used");
      res.status(409).json({ success: false, msg: err.message });
    } else
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return next(err);
        }
        const newUser = new User({
          username: req.body.username,
          hash: hash,
          isAdmin: false,
          name: req.body.name,
          jobTitle: req.body.jobTitle,
          bio: req.body.bio,
        });
        newUser.save((err, user) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ success: true, user: user });
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
      res.status(401).json({ success: false, msg: "Username not found" });
    } else {
      bcrypt.compare(req.body.password, user.hash, (err, result) => {
        if (err) {
          return next(err);
        }
        if (!result) {
          res.status(401).json({ success: false, msg: "Invalid password" });
        } else {
          // successful authentication, we issue the JWT
          const jwt = issueJWT(user);
          res.status(200).json({
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

//Update authenticated user
exports.users_id_put = function (req, res, next) {
  const _id = req.params.id;
  if (_id !== req.user._id.valueOf()) {
    //User trying to update someone else' record
    res.status(403).json({
      success: false,
      msg: "You are not allowed to update other user in the database",
    });
    return;
  }
  User.findByIdAndUpdate(
    _id,
    {
      _id: _id,
      username: req.body.username,
      name: req.body.name,
      jobTitle: req.body.jobTitle,
      bio: req.body.bio,
    },
    {},
    (err, user) => {
      if (err) {
        return next(err);
      }
      res
        .status(200)
        .json({ success: true, msg: "User has been updated", user: user });
    }
  );
};
