var express = require("express");
var router = express.Router();
var usersController = require("../controllers/usersController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* POST users for creating new user in database */
router.post("/", usersController.users_post);

/* POST users/login to validate user and get JWT */
router.post("/login", usersController.users_login_post);

module.exports = router;
