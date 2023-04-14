const mongoose = require("mongoose");
const dev = require(".");

const createDB = async () => {
  try {
    await mongoose.connect(dev.db.url);
    console.log("Connected to database");
  } catch (error) {
    console.log("Could not connect to database");
  }
};

module.exports = createDB;
