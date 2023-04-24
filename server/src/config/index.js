require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 3002,
    jwtSecretKey: process.env.JWT_PRIVATE_KEY,
    nodeMailerPass: process.env.SMTP_PASS,
    nodeMailerUser: process.env.SMTP_USER,
    clientUrl: process.env.CLIENT_URL,
    sessionSecretKey: process.env.SESSION_SECRET_KEY,
  },
  db: {
    url: process.env.DB_CLOUD_URL || process.env.DB_URL,
  },
};

module.exports = dev;
