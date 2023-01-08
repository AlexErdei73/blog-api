const Block = require("../models/block");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

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
			Post.findById(req.body.post, {}, {}, (err, post) => {
				if (err) {
					return next(err);
				}
				if (!post) {
					const error = {
						status: 404,
						message: "NOT FOUND",
					};
					res
						.status(404)
						.json({ success: false, post: null, block, errors: [error] });
					return next(error.status);
				}
				Block.find({ post: post._id }, {}, (err, blocks) => {
					if (err) {
						return next(err);
					}

					//All the IDs of the blocks including the new block
					const blockIds = blocks.map((block) => block._id.valueOf());
					console.log(blockIds);

					//The content of the old post, it does not have the new block id
					const oldContent = post.content.map((id) => id.valueOf());

					//Filter out the id of the new block
					const blockId = blockIds.filter(
						(id) => oldContent.indexOf(id) === -1
					)[0];
					console.log(blockId);

					//Push the id of the new block in the content of the post
					post.content.push(blockId);

					//Update the old post
					post.update(post, {}, (err) => {
						if (err) {
							return next(err);
						}

						res.status(200).json({
							success: true,
							block: blocks[blocks.indexOf(blockId)],
							errors: [],
						});
					});
				});
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
