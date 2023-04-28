const express = require("express");
const formidableMiddleware = require("express-formidable");
const session = require("express-session");

const {
  registerUser,
  verifyUser,
  userProfile,
  deleteUser,
  updateUser,
  updatePassword,
  resetPassword,
  logoutUser,
  loginUser,
} = require("../controllers/userController");
const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

const userRouter = express.Router();

userRouter.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 100 * 6000 },
  })
);

userRouter.post("/register", formidableMiddleware(), registerUser);
userRouter.post("/verify-user/", verifyUser);
userRouter.post("/login", formidableMiddleware(), isLoggedOut, loginUser);
userRouter.get("/logout", isLoggedIn, logoutUser);
userRouter.get("/profile", isLoggedIn, userProfile);
userRouter
  .route("/")
  .delete(isLoggedIn, deleteUser)
  .put(isLoggedIn, formidableMiddleware(), updateUser);
userRouter.post(
  "/update-password",
  isLoggedOut,
  formidableMiddleware(),
  updatePassword
);
userRouter.post("/reset-password/", isLoggedOut, resetPassword);

module.exports = userRouter;
