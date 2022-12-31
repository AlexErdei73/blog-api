const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.posts_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.posts_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Post needs a title")
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Title can only contain alphanumeric characters"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
      res.status(400).json({
        success: false,
        user: req.user,
        errors: errors.array(),
        post: {
          title: req.body.title,
          author: req.user._id,
          published: false,
        },
      });
      return;
    }
    const newPost = new Post({
      title: req.body.title,
      author: req.user._id,
      content: [],
      comments: [],
      likes: [],
      published: false,
    });
    newPost.save((err, post) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ success: true, user: req.user, errors: [], post });
    });
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
