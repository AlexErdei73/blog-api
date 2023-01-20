const Post = require("../models/post");
const Block = require("../models/block");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const async = require("async");

function _removeBlock(id, callback) {
  Block.findByIdAndRemove(id, {}, (err, block) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, block);
  });
}

function _removeBlocks(blockIds, callback) {
  async.parallel(
    blockIds.map(
      (id) =>
        function (cb) {
          _removeBlock(id, cb);
        }
    ),
    (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    }
  );
}

exports.posts_get = function (req, res, next) {
  Post.find({})
    .populate({ path: "author", select: "-hash" }) //Do not make hash public
    .populate(["content", "comments", "likes"])
    .exec((err, posts) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ success: true, posts });
    });
};

exports.blocks_get = function (req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return next(); //Avoid causing error by faulty mongo id
  Post.findById(req.params.id, {}, {}, (err, post) => {
    if (err) {
      return next(err);
    }
    if (!post) {
      return next();
    }
    res.status(200).json({
      success: true,
      blocks: post.populate("content").content,
      errors: [],
    });
  });
};

exports.comments_get = function (req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return next(); //Avoid causing error by faulty mongo id
  Post.findById(req.params.id, {}, {}, (err, post) => {
    if (err) {
      return next(err);
    }
    if (!post) {
      return next();
    }
    post.populate("comments", (err, post) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        comments: post.comments,
        errors: [],
      });
    });
  });
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
  if (!mongoose.isValidObjectId(req.params.id)) return next(); //Avoid causing error by faulty mongo id
  Post.findOne({ _id: req.params.id })
    .populate({ path: "author", select: "-hash" }) //Do not make hash public
    .populate(["content", "comments", "likes"])
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ success: true, post });
    });
};

exports.post_put = [
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
    if (!mongoose.isValidObjectId(req.params.id)) return next(); //Avoid causing error by faulty mongo id
    Post.findById(req.params.id, {}, {}, (err, post) => {
      if (err) {
        return next(err);
      }
      if (post.author.valueOf() !== req.user._id.valueOf()) {
        // User tries to update someone else's post
        const error = {
          msg: "The post, you are trying to update, is not yours",
        };
        res
          .status(403)
          .json({ success: false, user: req.user, errors: [error], post });
        return;
      }
      Post.findByIdAndUpdate(
        req.params.id,
        {
          _id: req.params.id,
          title: req.body.title,
          content: req.body.content || [],
          comments: req.body.comments || [],
          likes: req.body.likes || [],
          published: req.body.published || false,
        },
        {},
        (err, post) => {
          if (err) {
            return next(err);
          }
          res
            .status(200)
            .json({ success: true, user: req.user, errors: [], post });
        }
      );
    });
  },
];

exports.post_delete = function (req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return next(); //Avoid causing error by faulty mongo id
  //TODO Delete comments
  Post.findById(req.params.id, {}, {}, (err, post) => {
    if (err) {
      return next(err);
    }
    if (!post) {
      return next();
    }
    if (!req.user.isAdmin && req.user._id.valueOf() !== post.author.valueOf()) {
      const error = { msg: "You are not authorized to delete the post" };
      res.status(403).json({ success: false, user, post, errors: [error] });
      return;
    }
    _removeBlocks(post.content, (err) => {
      if (err) {
        return next(err);
      }
      post.remove((err, post) => {
        if (err) {
          return next(err);
        }
        res
          .status(200)
          .json({ success: true, user: req.user, post, errors: [] });
      });
    });
  });
};
