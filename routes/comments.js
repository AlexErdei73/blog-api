const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

router.get("/:commentId", commentsController.comment_get);

module.exports = (passport) => {
  router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    commentsController.comments_post
  );

  router.put(
    "/:commentId",
    passport.authenticate("jwt", { session: false }),
    commentsController.comment_put
  );

  router.delete(
    "/:commentId",
    passport.authenticate("jwt", { session: false }),
    commentsController.comment_delete
  );

  return router;
};
