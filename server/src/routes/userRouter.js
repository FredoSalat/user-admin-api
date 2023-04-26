const express = require("express");
const formidableMiddleware = require("express-formidable");
const session = require("express-session");

const {
  registerUser,
  verifyUser,
  login,
  logout,
  userProfile,
  deleteUser,
  updateUser,
  updatePassword,
  resetPassword,
} = require("../controllers/userController");
const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

const router = express.Router();

router.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 100 * 6000 },
  })
);

router.post("/register", formidableMiddleware(), registerUser);
router.post("/verify-user/", verifyUser);
router.post("/login", formidableMiddleware(), isLoggedOut, login);
router.get("/logout", isLoggedIn, logout);
router.get("/profile", isLoggedIn, userProfile);
router.delete("/", isLoggedIn, deleteUser);
router.put("/", isLoggedIn, formidableMiddleware(), updateUser);
router.post(
  "/update-password",
  isLoggedIn,
  formidableMiddleware(),
  updatePassword
);
router.post("/reset-password/", isLoggedIn, resetPassword);

module.exports = router;
