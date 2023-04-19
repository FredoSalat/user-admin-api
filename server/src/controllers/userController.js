const securePassword = require("../helpers/bcryptPassword");
const User = require("../models/userModel");

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

    const hashedPassword = await securePassword(password);

    const newUser = new User({ name, email, phone, password });
    await newUser.save();
    return res.status(201).json({ message: "User was created" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = registerUser;
