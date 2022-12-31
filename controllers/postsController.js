const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.posts_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.posts_post = [
  // TODO validation and sanitization,
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
    }
    res.send("NOT IMPLEMENTED");
  },
];

exports.post_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.post_put = [
  // TODO validation and sanitization
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
    }
    res.send("NOT IMPLEMETED");
  },
];

exports.post_delete = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};
