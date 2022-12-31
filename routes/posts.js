var express = require("express");
var router = express.Router();
var postsController = require("../controllers/postsController");

/* GET posts listing */
router.get("/", postsController.posts_get);

/* GET posts/:id to get the existing post */
router.get("/:id", postsController.post_get);

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
