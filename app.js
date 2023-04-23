//All your code goes here
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const coursesDb = './database/courses.json';
const usersDb = './database/users.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET /courses endpoint
app.get('/courses', (req, res) => {
  const { code, num } = req.query;
  let courses = JSON.parse(fs.readFileSync(coursesDb, 'utf-8'));

  if (code) {
    courses = courses.filter((course) => course.code === code);
  }

  if (num) {
    courses = courses.filter((course) => course.num === num);
  }

  res.status(200).json(courses);
});

// GET /account/:id endpoint
app.get('/account/:id', (req, res) => {
  const { id } = req.params;
  const users = JSON.parse(fs.readFileSync(usersDb, 'utf-8'));

  const user = users.find((user) => user.id === id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({ user });
});

// POST /users/login endpoint
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb, 'utf-8'));

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.status(200).json({ userId: user.id });
});

// POST /users/signup endpoint
app.post('/users/signup', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb, 'utf-8'));

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    res.status(409).json({ error: 'Username already in use' });
    return;
  }

  const id = Date.now().toString();
  users.push({ id, username, password });
  fs.writeFileSync(usersDb, JSON.stringify(users));

  res.status(201).json({ userId: id });
});

app.patch('/account/:id/courses/add', (req, res) => {
  const { id } = req.params;
  const { code, num, title, description } = req.body;
  const users = JSON.parse(fs.readFileSync(usersDb, 'utf-8'));

  const user = users.find((user) => user.id === id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const courseExists = user.courses.find(
    (course) => course.code === code && course.num === num
  );

  if (courseExists) {
    res.status(409).json({ error: 'Course already in user list' });
    return;
  }

  const newCourse = { code, num, title, description };
  user.courses.push(newCourse);
  fs.writeFileSync(usersDb, JSON.stringify(users));

  res.status(201).json({ course: newCourse });
});


//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = app;
