const bcrypt = require("bcryptjs");
require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");

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
exports.users_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username can contain oly alphanumeric characters"),
  body("name")
    .trim()
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage("Name can only contain alphanumeric characters"),
  body("jobTitle")
    .trim()
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage("Job title can only contain alphanumeric characters"),
  body("bio")
    .trim()
    .optional({ checkFalsy: true })
    .custom((value) => value.indexOf("'") === -1)
    .withMessage("Bio cannot contain apostrophe")
    .escape(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ success: false, errors: errors.array(), user: req.body.user });
      return;
    }
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
  },
];

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
exports.users_id_put = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username can contain oly alphanumeric characters"),
  body("name")
    .trim()
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage("Name can only contain alphanumeric characters"),
  body("jobTitle")
    .trim()
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage("Job title can only contain alphanumeric characters"),
  body("bio")
    .trim()
    .optional({ checkFalsy: true })
    .custom((value) => value.indexOf("'") === -1)
    .withMessage("Bio cannot contain apostrophe")
    .escape(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ success: false, errors: errors.array(), user: req.body.user });
      return;
    }
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
  },
];

//Delete userby admin
exports.users_id_delete = function (req, res, next) {
  console.log(req.user);
  if (!req.user.isAdmin) {
    res
      .status(403)
      .json({ success: false, msg: "You are not allowed to delete users" });
    return;
  }
  User.findByIdAndRemove(req.params.id, {}, (err, user) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ success: true, msg: "User is removed", user: user });
  });
};
