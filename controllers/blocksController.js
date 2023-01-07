const Block = require("../models/block");
const { body, validationResult } = require("express-validator");

exports.blocks_post = [
	body("post").trim().escape(),
	body("type").if((value) => value !== "code"),
	//Do not validate the text of code blocks.
	//It is a dangerous thing, make sure the code block never runs
	//On the front end!!!
	body("text")
		.isAlphanumeric("en-US", { ignore: " '.!?" })
		.withMessage(
			"Text can only contain alphanumeric characters and punctuation"
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
		newBlock.save((err, block) => {
			if (err) {
				return next(err);
			}
			//TODO Add block to the post
			res
				.status(200)
				.json({ success: true, block: block.populate("post"), errors: [] });
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
