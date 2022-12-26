var express = require("express");
var router = express.Router();
var usersController = require("../controllers/usersController");

/* GET users listing. */
router.get("/", usersController.users_get);

/* POST users for creating new user in database */
router.post("/", usersController.users_post);

/* POST users/login to validate user and get JWT */
router.post("/login", usersController.users_login_post);

module.exports = (passport) => {
  /* PUT users/:id to update the authenticated user */
  router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    usersController.users_id_put
  );

  /* DELETE users/:id to delete user by admin*/
  router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    usersController.users_id_delete
  );

  return router;
};
