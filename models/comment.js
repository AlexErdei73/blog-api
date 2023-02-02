const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Comment needs to have an author"],
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: [true, "Comment belongs to a post"],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
