var express = require("express");
var router = express.Router();
var usersController = require("../controllers/usersController");

/* GET users listing. */
router.get("/", usersController.users_get);

/* POST users for creating new user in database */
router.post("/", usersController.users_post);

/* POST users/login to validate user and get JWT */
router.post("/login", usersController.users_login_post);

module.exports = router;
