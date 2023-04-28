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

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.fields;
    const { image } = req.files;

    if (!name || !email || !phone || !password) {
      sendResponse(res, 404, false, "name, email phone or password is missing");
    }

    if (image && image.size > 1500000) {
      sendResponse(
        res,
        400,
        false,
        "Image size is too big. It can't be larger than 1.5 Mb"
      );
    }

    const isAlreadyRegistered = await User.findOne({ email });

    if (isAlreadyRegistered) {
      sendResponse(
        res,
        400,
        false,
        "this email has already been used to register another user"
      );
    }

    const isValidPassword = validator.isStrongPassword(password, {
      minLength: 10,
    });

    if (!isValidPassword) {
      sendResponse(
        res,
        400,
        false,
        "Password need to contain: minimum 10 characters, 1 lowercase character, 1 uppercase character, 1 symbol and 1 number"
      );
    }

    const hashedPassword = await securePassword(password);

    const token = jwt.sign(
      { name, email, hashedPassword, phone, image },
      dev.app.jwtSecretKey,
      { expiresIn: "15m" }
    );

    const emailData = {
      email,
      subject: "User verification",
      html: `<h1>Hi ${name}!</h1> 
      <h3>Please click the following button to activate your account <br>
      <a href="${dev.app.clientUrl}/app/users/activate/${token}
      "><button style= "background-color:#008CBA; 
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;"type="button">Click Me!</button></a>
      </h3>`,
    };

    sendEmail(emailData);

    sendResponse(
      res,
      201,
      true,
      `Verification link has been sent to ${email}`,
      token
    );
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      sendResponse(res, 500, false, "no token to be found");
    }
    jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
      if (err) {
        sendResponse(res, 401, false, "Token has expired");
      }
      const { name, email, hashedPassword, phone, image } = decoded;
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      if (image) {
        user.image.data = fs.readFileSync(image.path);
        user.image.contentType = image.type;
      }
      const newUser = await user.save();
      if (!newUser) {
        sendResponse(res, 404, false, "User could not be saved");
      }

      sendResponse(
        res,
        200,
        true,
        "User email has been verified and user has been added"
      );
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 404, false, "User not found");
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

const logoutUser = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");
    sendResponse(res, 200, true, "User has been logged out");
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = await User.findById(req.session.userId, {
      password: 0,
      image: 0,
    });
    sendResponse(res, 200, true, "User profile", {
      user: userData,
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findByIdAndDelete(req.session.userId);

    if (!userToDelete) {
      sendResponse(res, 404, false, "User to be deleted not found");
    }

    sendResponse(res, 200, true, "Deleted user");
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.fields;
    const { image } = req.files;
    const userToUpdate = await User.findByIdAndUpdate(req.session.userId, {
      name,
      phone,
      image,
    });

    if (!userToUpdate) {
      sendResponse(res, 404, false, "User to be updated not found");
    }

    if (image) {
      userToUpdate.image.data = fs.readFileSync(image.path);
      userToUpdate.image.contentType = image.type;
    }

    await userToUpdate.save();

    sendResponse(res, 200, true, "User was updated");
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.fields;

    if (!email || !password) {
      sendResponse(res, 404, false, "Email or password is missing");
    }

    const user = User.findOne({ email });

    if (!user) {
      sendResponse(res, 404, false, "User does not exist");
    }

    const isValidPassword = validator.isStrongPassword(password, {
      minLength: 10,
    });

    if (!isValidPassword) {
      sendResponse(
        res,
        400,
        false,
        "Password need to contain: minimum 10 characters, 1 lowercase character, 1 uppercase character, 1 symbol and 1 number"
      );
    }

    const hashedPassword = await securePassword(password);

    const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, {
      expiresIn: "15m",
    });

    const emailData = {
      email,
      subject: "Forgot password?",
      html: `<h1>Hi ${user.name}!</h1> 
      <h3>Please click the following button to reset your password <br>
      <a href="${dev.app.clientUrl}/app/users/reset-password/${token}
      "><button style= "background-color:#008CBA; 
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;"type="button">Click Me!</button></a>
      </h3>`,
    };

    sendEmail(emailData);

    sendResponse(
      res,
      201,
      true,
      `Restoring password link has been sent to ${email}`,
      token
    );
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      sendResponse(res, 500, false, "No token to be found");
    }
    jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
      if (err) {
        sendResponse(res, 401, false, "Token has expired");
      }
      const { email, hashedPassword } = decoded;

      const updateData = await User.updateOne(
        { email: email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );

      if (!updateData) {
        sendResponse(res, 404, false, "New password could not be saved");
      }
      sendResponse(res, 200, true, "Password has been updated");
    });
  } catch (error) {
    sendResponse(res, 500, false, `Server error: ${error.message}`);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  userProfile,
  deleteUser,
  updateUser,
  updatePassword,
  resetPassword,
};
