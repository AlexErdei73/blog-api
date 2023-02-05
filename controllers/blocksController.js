const Block = require("../models/block");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

function _addPostContent(post, callback) {
	Post.findById(post, {}, {}, (err, post) => {
		if (err) {
			callback(err, null);
			return;
		}
		if (!post) {
			// No post found
			callback(null, null);
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

			//Push the id of the new block in the content of the post
			post.content.push(blockId);

			//Update the old post
			post.updateOne(post, {}, (err) => {
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

function _removePostContent(block, callback) {
	const id = block._id.valueOf();
	const post = block.post;

	const index = post.content.map((blockId) => blockId.valueOf()).indexOf(id);

	post.content.splice(index, 1);

	Post.updateOne({ _id: post._id }, post, {}, (err) => {
		if (err) {
			callback(err, null);
			return;
		}
		block.post = post._id;
		callback(null, block);
	});
}

exports.blocks_post = [
	body("post")
		.trim()
		.isLength({ min: 1, message: "Comment belongs to a post" })
		.custom((value) => mongoose.isValidObjectId(value))
		.withMessage("Post needs to be a valid mongo id"),
	body("type")
		.isIn(["subtitle", "paragraph", "code"])
		.withMessage("Type must be subtitle, paragraph or code")
		.custom((value, { req }) => {
			if (value === "code") {
				if (req.body.language)
					return (
						[" ", "html", "css", "javascript"].indexOf(req.body.language) !== -1
					);
			} else return true;
		})
		.withMessage(
			"Code blocks need to have language property as space character, html, css or javascript"
		),
	//Do not validate the text of code blocks.
	//It is a dangerous thing, make sure the code block never runs
	//On the front end!!!
	body("text")
		.if((req) => req.body.type !== "code")
		.isAlphanumeric("en-US", { ignore: " '.!?," })
		.withMessage(
			"Text can only contain alphanumeric characters and for punctuation the '.!?, characters"
		),
	body("links.*.url").isURL(),
	body("links.*.description").trim().isAlphanumeric("en-US", { ignore: " " }),
	body("links.*.position").isInt(),
	function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
				block: {
					post: req.body.post,
					type: req.body.type,
					text: req.body.text,
					links: req.body.links,
					language: req.body.language || null,
				},
			});
			return;
		}
		const newBlock = new Block({
			post: req.body.post,
			type: req.body.type,
			text: req.body.text,
			links: req.body.links,
			language: req.body.language || null,
		});
		newBlock.save((err) => {
			if (err) {
				return next(err);
			}
			//Add block to the post
			_addPostContent(req.body.post, (err, block) => {
				if (err || !block) {
					//Remove the new block, because it has not been added to the post
					newBlock.remove((error, newBlock) => {
						if (error) {
							return next(error);
						}
						// Post was not found
						if (!block) return next();
						// Error happened
						if (!err.status) return next(err);
						else {
							res
								.status(err.status)
								.json({ success: false, block: newBlock, errors: [err] });
							return next(err.status);
						}
					});
					return;
				}
				res.status(200).json({ success: true, block, errors: [] });
			});
		});
	},
];

exports.block_get = function (req, res, next) {
	const id = req.params.blockId;
	Block.findOne({ _id: id }, (err, block) => {
		if (err) {
			return next(err);
		}
		if (!block) {
			return next();
		}
		res.status(200).json({ success: true, block, errors: [] });
	});
};

exports.block_put = [
	body("post")
		.trim()
		.isLength({ min: 1, message: "Comment belongs to a post" })
		.custom((value) => mongoose.isValidObjectId(value))
		.withMessage("Post needs to be a valid mongo id"),
	body("type")
		.isIn(["subtitle", "paragraph", "code"])
		.withMessage("Type must be subtitle, paragraph or code")
		.custom((value, { req }) => {
			if (value === "code") {
				if (req.body.language)
					return (
						[" ", "html", "css", "javascript"].indexOf(req.body.language) !== -1
					);
			} else return true;
		})
		.withMessage(
			"Code blocks need to have language property as space character, html, css or javascript"
		),
	//Do not validate the text of code blocks.
	//It is a dangerous thing, make sure the code block never runs
	//On the front end!!!
	body("text")
		.if((req) => req.body.type !== "code")
		.isAlphanumeric("en-US", { ignore: " '.!?," })
		.withMessage(
			"Text can only contain alphanumeric characters and for punctuation the '.!?, characters"
		),
	body("links.*.url").isURL(),
	body("links.*.description").trim().isAlphanumeric("en-US", { ignore: " " }),
	body("links.*.position").isInt(),
	function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
				block: {
					post: req.body.post,
					type: req.body.type,
					text: req.body.text,
					links: req.body.links,
					language: req.body.language || null,
				},
			});
			return;
		}
		if (!mongoose.isValidObjectId(req.params.blockId)) return next(); //Avoid causing error by faulty mongo id
		Block.findByIdAndUpdate(
			req.params.blockId,
			{
				post: req.body.post,
				type: req.body.type,
				text: req.body.text,
				links: req.body.links,
				language: req.body.language || null,
			},
			{ returnDocument: "after" },
			(err, updatedBlock) => {
				if (err) {
					return next(err);
				}
				if (!updatedBlock) {
					return next();
				}
				res
					.status(200)
					.json({ success: true, block: updatedBlock, errors: [] });
			}
		);
	},
];

exports.block_delete = function (req, res, next) {
	if (!mongoose.isValidObjectId(req.params.blockId)) return next(); //Avoid causing error by faulty mongo id
	const id = req.params.blockId;
	Block.findOne({ _id: id })
		.populate("post")
		.exec((err, block) => {
			if (err) {
				return next(err);
			}
			if (!block) {
				return next();
			}
			const author = block.post.author.valueOf();
			if (author !== req.user._id.valueOf() && !req.user.isAdmin()) {
				const error = {
					status: 403,
					message: "Unauthorized",
				};
				res.status(403).json({ success: false, block: null, errors: [error] });
				return next(error.status);
			}
			_removePostContent(block, (err, block) => {
				if (err) {
					return next(err);
				}
				Block.findByIdAndRemove(id, {}, (err, doc) => {
					if (err) {
						return next(err);
					}
					res.status(200).json({ success: true, block, errors: [] });
				});
			});
		});
};
