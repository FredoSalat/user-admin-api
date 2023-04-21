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
const { match } = require("assert");

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
      return res.status(404).json({ message: "Wrong password" });
    }
    return res.status(200).json({ message: "User was successfully logged in" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const logout = (req, res) => {
  try {
    return res.status(200).json({
      message: "User has been logged out",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const profile = (req, res) => {
  try {
    return res.status(200).json({
      message: "User profile",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = { registerUser, verifyUser, login, logout, profile };
