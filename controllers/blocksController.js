const Block = require("../models/block");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

function _updatePost(post, method, callback) {
  Post.findById(post, {}, {}, (err, post) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (!post) {
      const error = {
        status: 404,
        message: "NOT FOUND",
      };
      callback(error, null);
      return;
    }
    Block.find({ post: post._id }, (err, blocks) => {
      if (err) {
        callback(err, null);
      }

      //All the IDs of the blocks including the new block
      const blockIds = blocks.map((block) => block._id.valueOf());
      console.log(blockIds);

      //The content of the old post, it does not have the new block id
      const oldContent = post.content.map((id) => id.valueOf());

      //Filter out the id of the new block
      const blockId = blockIds.filter((id) => oldContent.indexOf(id) === -1)[0];
      console.log(blockId);

      switch (method) {
        case "push":
          //Push the id of the new block in the content of the post
          post.content.push(blockId);
          break;
        case "splice":
          //Remove the id of the new block from the content of the post
          post.content.splice(post.content.indexOf(blockId), 1);
          break;
      }

      //Update the old post
      post.update(post, {}, (err) => {
        if (err) {
          callback(err, null);
          return;
        }

        callback(null, blocks[blockIds.indexOf(blockId)]);
        return;
      });
    });
  });
}

exports.blocks_post = [
  body("post").trim().escape(),
  body("type")
    .isIn(["subtitle", "paragraph", "code"])
    .withMessage("Type must be subtitle, paragraph or code"),
  //Do not validate the text of code blocks.
  //It is a dangerous thing, make sure the code block never runs
  //On the front end!!!
  body("text")
    .if((req) => req.body.type !== "code")
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
        block: {
          post: req.body.post,
          type: req.body.typa,
          text: req.body.text,
        },
      });
      return;
    }
    const newBlock = new Block({
      post: req.body.post,
      type: req.body.type,
      text: req.body.text,
    });
    newBlock.save((err) => {
      if (err) {
        return next(err);
      }
      //Add block to the post
      _updatePost(req.body.post, "push", (err, block) => {
        if (err) {
          if (!err.status) return next(err);
          else {
            res
              .status(err.status)
              .json({ success: false, block, errors: [err] });
            return next(err.status);
          }
        }
        console.log(block);
        res.status(200).json({ success: true, block, errors: [] });
      });
    });
  },
];

exports.block_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.block_put = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.block_delete = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};
