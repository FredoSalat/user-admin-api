const express = require("express");
const formidableMiddleware = require("express-formidable");
const session = require("express-session");

const dev = require("../config");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const {
  logoutAdmin,
  loginAdmin,
  getAllUsers,
} = require("../controllers/adminController");

const adminRouter = express.Router();

adminRouter.use(
  session({
    name: "admin_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 100 * 6000 },
  })
);

adminRouter.post(
  "/login",
  formidableMiddleware(),
  isLoggedOut,
  isAdmin,
  loginAdmin
);
adminRouter.get("/logout", isLoggedIn, logoutAdmin);
adminRouter.get("/dashboard", isLoggedIn, isAdmin, getAllUsers);

module.exports = adminRouter;
