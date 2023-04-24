const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
//const cookieParser = require("cookie-parser");

const dev = require("./src/config");
const createDB = require("./src/config/db");
const userRouter = require("./src/routes/userRouter");

const app = express();

const PORT = dev.app.serverPort;

//app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "testing route working" });
});

app.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT} `);
  createDB();
});
