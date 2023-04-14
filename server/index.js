const express = require("express");
const dev = require("./src/config");

const app = express();

const PORT = dev.app.serverPort;

app.get("/", (req, res) => {
  res.json({ message: "testing route" });
});

app.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT} `);
});
