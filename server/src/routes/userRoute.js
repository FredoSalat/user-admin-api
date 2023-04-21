const express = require("express");
const formidableMiddleware = require("express-formidable");

const {
  registerUser,
  verifyUser,
  login,
  logout,
  profile,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", formidableMiddleware(), registerUser);

router.post("/verify-user/", verifyUser);

router.post("/login", formidableMiddleware(), login);

router.get("/logout", logout);

router.get("/profile", profile);

module.exports = router;
