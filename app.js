//All your code goes here
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

const coursesDb = "./database/courses.json";
const usersDb = "./database/users.json";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.status(200).sendFile(__dirname + "/public/index.html");
});

app.get("/courses", (req, res) => {
  const { num, code } = req.query;
  let courses = JSON.parse(fs.readFileSync(coursesDb));
  if (num) {
    if (num.length === 4) {
      courses = courses.filter((course) => course.number === num);
    } else if (num.length === 1) {
      courses = courses.filter((course) => course.number[0] === num);
    }
  }
  if (code) {
    courses = courses.filter((course) => course.code === code);
  }
  res.status(200).json(courses);
});

app.get("/account/:id", (req, res) => {
  const { id } = req.params;
  const users = JSON.parse(fs.readFileSync(usersDb));
  const user = users.find((user) => user.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/users/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb));
  const user = users.find((user) => user.username === username);
  if (user) {
    if (user.password === password) {
      res.status(200).json({ userId: user.id });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/users/signup", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb));
  const user = users.find((user) => user.username === username);
  if (user) {
    res.status(409).json({ error: "Username already taken" });
  } else {
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      courses: [],
    };
    users.push(newUser);
    fs.writeFileSync(usersDb, JSON.stringify(users));
    res.status(201).json({ userId: newUser.id });
  }
});

app.patch("/account/:id/courses/add", (req, res) => {
  const { id } = req.params;
  const { course } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb));
  const user = users.find((user) => user.id === id);
  if (!user) {
    res.status(401).json({ error: "User not found" });
  } else if (!course) {
    res.status(400).json({ error: "Invalid course" });
  } else if (user.courses.includes(course)) {
    res.status(409).json({ error: "Course already added" });
  } else {
    user.courses.push(course);
    fs.writeFileSync(usersDb, JSON.stringify(users));
    res.status(201).json({ courses: user.courses });
  }
});

app.patch("/account/:id/courses/remove", (req, res) => {
  const { id } = req.params;
  const { course } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb));
  const user = users.find((user) => user.id === id);
  if (!user) {
    res.status(401).json({ error: "User not found" });
  } else if (!user.courses.includes(course)) {
    res.status(409).json({ error: "Course not found" });
  } else {
    user.courses = user.courses.filter((c) => c !== course);
    fs.writeFileSync(usersDb, JSON.stringify(users));
    res.status(200).json({ courses: user.courses });
  }
});
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = app;
