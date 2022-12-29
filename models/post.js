const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
	author: {
		type: mongoose.Types.ObjectId,
		ref: "User",
		required: [true, "Post needs to have an author"],
	},
	title: {
		type: String,
		required: [true, "Title is required"],
	},
	content: [
		{
			type: mongoose.Types.ObjectId,
			ref: "Block",
		},
	],
	comments: [
		{
			type: mongoose.Types.ObjectId,
			ref: "Comment",
		},
	],
	likes: [
		{
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
	],
	published: Boolean,
});

module.exports = mongoose.model("Post", PostSchema);
