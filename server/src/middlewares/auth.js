const User = require("../models/userModel");

const isLoggedIn = (req, res, next) => {
  try {
    if (req.session.userId) {
      next();
    } else {
      return res.status(400).json({ message: "please login" });
    }
  } catch (error) {
    console.log(error);
  }
};

const isLoggedOut = (req, res, next) => {
  try {
    if (req.session.userId) {
      return res.status(400).json({ message: "already signed in" });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.session.userId);
    if (!admin) {
      res.status(400).json({ message: "no admin found" });
    }
    console.log(admin.is_admin);
    if (admin.is_admin === true) {
      next();
    } else {
      return res.status(400).json({ message: "user is not an admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin };
