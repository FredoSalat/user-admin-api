const jwt = require("jsonwebtoken");
const fs = require("fs");
const validator = require("validator");

const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const User = require("../models/userModel");
const sendEmail = require("../helpers/email");
const dev = require("../config");
const { all } = require("../routes/adminRouter");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (user.is_admin === false) {
      return res.status(400).json({ message: "User is not an admin" });
    }

    const matchingPassword = await comparePassword(password, user.password);

    if (!matchingPassword) {
      return res.status(404).json({
        message: "Wrong password",
      });
    }
    req.session.userId = user._id;

    return res.status(200).json({
      user: { name: user.name, email: user.email },
      message: "User was successfully logged in",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const logoutAdmin = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");
    return res.status(200).json({
      message: "User has been logged out",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({ is_admin: false });
    if (!allUsers) {
      res.status(400).json({ message: "No users" });
    }
    return res.status(200).json({
      message: "All users",
      user: allUsers,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
};
