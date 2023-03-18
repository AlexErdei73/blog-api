var express = require("express");
var router = express.Router();
var postsController = require("../controllers/postsController");

/* GET posts listing */
router.get("/", postsController.posts_get);

/* GET posts/:id to get the existing post */
router.get("/:id", postsController.post_get);

/* GET posts/:id/blocks to get the content of the post */
router.get("/:id/blocks", postsController.blocks_get);

/* GET posts/:id/comments to get the comments of the post */
router.get("/:id/comments", postsController.comments_get);

/* PUT posts/:id/likes to toggle like in the post likes */
router.put("/:id/likes", postsController.likes_put);

module.exports = (passport) => {
	/* POST posts to add new post to database */
	router.post(
		"/",
		passport.authenticate("jwt", { session: false }),
		postsController.posts_post
	);

	/* PUT posts/:id to update the existing post */
	router.put(
		"/:id",
		passport.authenticate("jwt", { session: false }),
		postsController.post_put
	);

	/* DELETE posts/:id to delete the post */
	router.delete(
		"/:id",
		passport.authenticate("jwt", { session: false }),
		postsController.post_delete
	);

	return router;
};
