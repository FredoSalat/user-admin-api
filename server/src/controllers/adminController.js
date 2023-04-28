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
const sendResponse = require("../helpers/responseHandler");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 400, false, "User does not exist");
    }

    const matchingPassword = await comparePassword(password, user.password);

    if (!matchingPassword) {
      sendResponse(res, 404, false, "Wrong password");
    }
    req.session.userId = user._id;

    sendResponse(res, 200, true, "User was successfully logged in", {
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const logoutAdmin = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");
    sendResponse(res, 200, true, "User has been logged out");
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({ is_admin: false });
    if (!allUsers) {
      sendResponse(res, 400, false, "No users");
    }
    return res.status(200).json({
      message: "All users",
      user: allUsers,
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};
module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
};
