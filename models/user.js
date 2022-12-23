const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  hash: String,
  isAdmin: Boolean,
});

module.exports = mongoose.model("User", UserSchema);
