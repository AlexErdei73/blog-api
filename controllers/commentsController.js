const Comment = require("../models/comment");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

function _removeCommentFromPost(postId, commentId, callback) {
  Post.findById(postId, {}, {}, (err, post) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (!post) {
      callback(null, null);
      return;
    }
    const indexOfComment = post.comments
      .map((id) => id.valueOf())
      .indexOf(commentId);
    post.comments.splice(indexOfComment, 1);
    post.save((err) => {
      if (err) {
        callback(err, post);
        return;
      }
      callback(null, post);
    });
  });
}

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

module.exports.comment_put = [
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
          text: req.body.text,
        },
      });
      return;
    }
    Comment.findById(req.params.commentId, {}, {}, (err, comment) => {
      if (err) {
        return next(err);
      }
      if (!comment) {
        return next();
      }
      if (
        req.user._id.valueOf() !== comment.author.valueOf() &&
        !req.user.isAdmin
      ) {
        res.status(403).json({
          success: false,
          errors: [{ status: 403, message: "Unauthorized" }],
          comment,
        });
        return;
      }
      comment.text = req.body.text;
      comment.save((err, comment) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ success: true, errors: [], comment });
      });
    });
  },
];

module.exports.comment_delete = function (req, res, next) {
  Comment.find({ _id: req.params.commentId }).exec((err, comments) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (comments.length === 0) {
      return next();
    }
    const comment = comments[0];
    if (
      req.user._id.valueOf() !== comment.author.valueOf() &&
      !req.user.isAdmin
    ) {
      res.status(403).json({
        success: false,
        errors: [{ status: 403, message: "Unauthorized" }],
        comment,
      });
      return;
    }
    _removeCommentFromPost(comment.post, comment._id, (err, post) => {
      if (err) {
        return next(err);
      }
      if (!post) {
        return next();
      }
      comment.remove((err, comment) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ success: true, errors: [], comment });
      });
    });
  });
};
