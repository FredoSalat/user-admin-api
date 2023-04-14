const User = require("../models/userModel");
const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.status(201).json({ message: "User was created" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = addUser;
