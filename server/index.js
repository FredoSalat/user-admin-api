const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const dev = require("./src/config");
const createDB = require("./src/config/db");
const userRouter = require("./src/routes/userRoute");

const app = express();

const PORT = dev.app.serverPort;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "testing route" });
});

app.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT} `);
  createDB();
});
