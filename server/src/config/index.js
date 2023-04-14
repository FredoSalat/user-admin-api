require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 3002,
  },
};

module.exports = dev;
