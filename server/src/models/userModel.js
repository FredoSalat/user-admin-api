const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, "Name must consist of a minimum of 2 characters"],
    maxLength: [80, "Name can be maximum 30 characters"],
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "invalid email"],
  },
  password: {
    type: String,
    require: true,
    validate: {
      validator: function (value) {
        const result = validator.isStrongPassword(value, {
          minLength: 10,
          returnScore: true,
        });
        return result;
      },
      message:
        "Password need to contain: minimum 10 characters, 1 lowercase character, 1 uppercase character, 1 symbol and 1 number",
    },
  },
  phone: {
    type: String,
    require: [true, "entering phone number is required"],
    minLength: 6,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  /*  image: {
    data: Buffer,
    contentType: String,
  }, */
  image: {
    type: String,
    default: "/public/images/users/default-profile.jpg",
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
