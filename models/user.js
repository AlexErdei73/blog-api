const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  hash: String,
  isAdmin: Boolean,
  name: String,
  jobTitle: String,
  bio: String,
});

module.exports = mongoose.model("User", UserSchema);
