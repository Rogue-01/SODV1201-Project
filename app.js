const express = require("express");
const fs = require("fs");
const app = express();
//All your code goes here
app.get("/courses", (req, res) => {
  let courses = JSON.parse(
    fs.readFileSync(__dirname + "database/courses.json")
  );
  res.send(courses);
});

app.get("/account/:id", (req, res) => {
  console.log(req.params.id);
});

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = app;
