const express = require("express");
const formidableMiddleware = require("express-formidable");
const session = require("express-session");

const {
  registerUser,
  verifyUser,
  login,
  logout,
  profile,
} = require("../controllers/userController");
const dev = require("../config");
const isLoggedIn = require("../middlewares/auth");

const router = express.Router();

router.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 }, // maxAge 10 min
  })
);

router.post("/register", formidableMiddleware(), registerUser);
router.post("/verify-user/", verifyUser);
router.post("/login", formidableMiddleware(), login);
router.get("/logout", logout);
router.get("/profile", isLoggedIn, profile);

module.exports = router;
