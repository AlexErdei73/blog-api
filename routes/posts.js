var express = require("express");
var router = express.Router();
var postsController = require("../controllers/postsController");

/* GET posts listing */
router.get("/", postsController.posts_get);

module.exports = (passport) => {
  return router;
};
