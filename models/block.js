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
	text: String,
});

module.exports = mongoose.model("Block", BlockSchema);
