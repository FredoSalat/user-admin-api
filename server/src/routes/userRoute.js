const express = require("express");
const formidableMiddleware = require("express-formidable");

const registerUser = require("../controllers/userController");

const router = express.Router();

router.post("/register", formidableMiddleware(), registerUser);

module.exports = router;
