const Comment = require("../models/comment");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

module.exports.comments_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

module.exports.comment_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

module.exports.comments_post = [
  body("post")
    .trim()
    .escape()
    .isLength({ min: 1, message: "Comment belongs to a post" }),
  body("text")
    .trim()
    .isLength({ min: 1, message: "Comment cannot be empty" })
    .isAlphanumeric("en-US", { ignore: " '.!?," })
    .withMessage(
      "Text can only contain alphanumeric characters and for punctuation the '.!?, characters"
    ),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
        comment: {
          author: req.user._id,
          post: req.body.post,
          text: req.body.text,
        },
      });
      return;
    }
    Post.findById(req.body.post, {}, {}, (err, post) => {
      if (err) {
        return next(err);
      }
      if (!post) {
        return next();
      }
      const comment = new Comment({
        author: req.user._id,
        post: req.body.post,
        text: req.body.text,
      });
      comment.save((err, comment) => {
        if (err) {
          return next(err);
        }
        post.comments.push(comment._id);
        post.save((err, post) => {
          if (err) {
            return next();
          }
          res.status(200).json({ success: true, errors: [], comment });
        });
      });
    });
  },
];

module.exports.comment_put = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

module.exports.comment_delete = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};
