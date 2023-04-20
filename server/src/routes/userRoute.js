const express = require("express");
const formidableMiddleware = require("express-formidable");

const {
  registerUser,
  verifyUser,
  login,
  logout,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", formidableMiddleware(), registerUser);

router.post("/verify-user/", verifyUser);

router.post("/login", login);

router.get("/logout", logout);

module.exports = router;
