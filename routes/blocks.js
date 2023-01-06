const express = require("express");
const router = express.Router();
const blocksController = require("../controllers/blocksController");

/* GET /posts/:id/blocks to get post content */
//router.get("/", blocksController.blocks_get);

/* GET /posts/:id/blocks/:blockId to get block */
router.get("/:blockId", blocksController.block_get);

module.exports = (passport) => {
  /* POST /posts/:id/blocks to add new block to post content */
  router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    blocksController.blocks_post
  );

  /* PUT /posts/:id/blocks/:blockId to update a block */
  router.put(
    "/:blockId",
    passport.authenticate("jwt", { session: false }),
    blocksController.block_put
  );

  /* DELETE /posts/:id/blocks/:blockId to delete a block */
  router.delete(
    "/:blockId",
    passport.authenticate("jwt", { session: false }),
    blocksController.block_delete
  );

  return router;
};
