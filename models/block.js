const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlockSchema = new Schema({
	post: {
		type: mongoose.Types.ObjectId,
		ref: "Post",
		required: [true, "Block belongs to a post"],
	},
	type: {
		type: String,
		enum: ["subtitle", "paragraph", "code"],
		required: [true, "Block needs to have a type"],
	},
	language: {
		type: String,
		required: false,
	},
	text: String,
	links: {
		type: [
			{
				url: String,
				description: String,
				position: Number,
			},
		],
	},
});

module.exports = mongoose.model("Block", BlockSchema);
