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

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.fields;
    const { image } = req.files;

    if (!name || !email || !phone || !password) {
      return res
        .status(404)
        .json({ message: "name, email phone or password is missing" });
    }

    if (image && image.size > 1500000) {
      return res.status(400).json({
        message: "Image size is too big. It can't be larger than 1.5 Mb",
      });
    }

    const isAlreadyRegistered = await User.findOne({ email });

    if (isAlreadyRegistered) {
      return res.status(400).json({
        message: "this email has already been used to register another user",
      });
    }

    const isValidPassword = validator.isStrongPassword(password, {
      minLength: 10,
    });

    if (!isValidPassword) {
      return res.status(400).json({
        message:
          "Password need to contain: minimum 10 characters, 1 lowercase character, 1 uppercase character, 1 symbol and 1 number",
      });
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

    return res.status(201).json({
      message: `Verification link has been sent to ${email}`,
      token,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(500).json({ message: "no token to be found" });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token has expired" });
      }
      const { name, email, hashedPassword, phone, image } = decoded;
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        is_verified: true,
      });

      if (image) {
        user.image.data = fs.readFileSync(image.path);
        user.image.contentType = image.type;
      }
      const newUser = await user.save();
      if (!newUser) {
        return res.status(404).json({ message: "User could not be saved" });
      }
      return res.status(200).json({
        message: "User email has been verified and user has been added",
      });
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");
    return res.status(200).json({
      message: "User has been logged out",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = await User.findById(req.session.userId, {
      password: 0,
      image: 0,
    });
    return res.status(200).json({
      message: "User profile",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findByIdAndDelete(req.session.userId);

    if (!userToDelete) {
      return res.status(404).json({ message: "User to be deleted not found" });
    }

    return res.status(200).json({
      message: "Deleted user",
    });
  } catch (error) {
    return res.status(500).json(error.message);
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
      return res.status(404).json({ message: "User to be updated not found" });
    }

    if (image) {
      userToUpdate.image.data = fs.readFileSync(image.path);
      userToUpdate.image.contentType = image.type;
    }

    await userToUpdate.save();

    return res.status(200).json({
      message: "User was updated",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.fields;

    console.log(email, password);

    if (!email || !password) {
      return res.status(404).json({ message: "Email or password is missing" });
    }

    const user = User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isValidPassword = validator.isStrongPassword(password, {
      minLength: 10,
    });

    if (!isValidPassword) {
      return res.status(400).json({
        message:
          "Password need to contain: minimum 10 characters, 1 lowercase character, 1 uppercase character, 1 symbol and 1 number",
      });
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

    return res.status(201).json({
      message: `Restoring password link has been sent to ${email}`,
      token,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(500).json({ message: "no token to be found" });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token has expired" });
      }
      const { email, hashedPassword } = decoded;

      const user = User.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );

      if (!user) {
        return res
          .status(404)
          .json({ message: "New password could not be saved" });
      }
      return res.status(200).json({
        message: "Password has been updated",
      });
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  login,
  logout,
  userProfile,
  deleteUser,
  updateUser,
  updatePassword,
  resetPassword,
};
