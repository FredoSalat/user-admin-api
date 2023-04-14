require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 3002,
  },
  db: {
    url: process.env.DB_CLOUD_URL || process.env.DB_URL,
  },
};

module.exports = dev;
