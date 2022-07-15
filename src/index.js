const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/route");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());https://github.com/Shivanandkasture/Book-Mangement-Project.git

const url =
  "mongodb+srv://shivanandkasture:GrjERPPxK02MvUW6@cluster0.a35v6.mongodb.net/ShivanandKasture-DB?retryWrites=true&w=majority";
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("mongoDb is connected"))
  .catch((error) => console.log(error));

app.use("/", route);

app.listen(process.env.PORT || 3000, () => {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
