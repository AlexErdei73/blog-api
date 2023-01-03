const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.posts_get = function (req, res, next) {
	Post.find({})
		//.populate(["content", "comments", "likes"])
		.exec((err, posts) => {
			if (err) {
				return next(err);
			}
			res.status(200).json({ success: true, posts });
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
	Post.findOne({ _id: req.params.id })
		.populate("author")
		//.populate(["content", "comments", "likes"])
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
	//TODO Delete content
	//TODO Delete comments
	Post.findById(req.params.id, {}, {}, (err, post) => {
		if (err) {
			return next(err);
		}
		if (!post) {
			const error = {
				status: 404,
				msg: "Not found",
			};
			res.status(404).json({ success: false, user: req.user, errors: [error] });
			return next(error.status);
		}
		if (!req.user.isAdmin && req.user._id.valueOf() !== post.author.valueOf()) {
			const error = { msg: "You are not authorized to delete the post" };
			res.status(403).json({ success: false, user, post, errors: [error] });
			return;
		}
		post.remove((err, post) => {
			if (err) {
				return next(err);
			}
			res.status(200).json({ success: true, user: req.user, post, errors: [] });
		});
	});
};
