const express = require("express");
const app = express();
const port = 3500;
require("./DB/Connection");
const router = require("./router/router");
const cors = require("cors");
const cookieParser = require("cookie-parser")

app.get("/", (req, res) => {
  res.status(201).json("started server!");
});

app.use(express.json());
app.use(cors({
  
}));
app.use(router);
app.use(cookieParser());

app.listen(port, () => {
  console.log("start run");
});
