const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();

// Basic Security
app.use(helmet());

// Rate Limiter: 100 requests per 2 minutes
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again after 2 minutes.'
});
app.use(limiter);

app.use(bodyParser.json());

// CREATE a new post
app.post('/posts', (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const author = req.body.author;

  const sql = 'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)';
  db.query(sql, [title, content, author], (err, result) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.status(201).send({
        id: result.insertId,
        title: title,
        content: content,
        author: author
      });
    }
  });
});

// READ all posts
app.get('/posts', (req, res) => {
  const sql = 'SELECT * FROM posts';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.send(results);
    }
  });
});

// READ a single post by ID
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, results) => {
    if (err) {
      res.status(500).send('Database error');
    } else if (results.length === 0) {
      res.status(404).send({ message: 'Post not found' });
    } else {
      res.send(results[0]);
    }
  });
});

// UPDATE a post
app.put('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  const author = req.body.author;

  const sql = 'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?';
  db.query(sql, [title, content, author, postId], (err) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.send({
        id: postId,
        title: title,
        content: content,
        author: author
      });
    }
  });
});

// DELETE a post
app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'DELETE FROM posts WHERE id = ?';
  db.query(sql, [postId], (err) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.send({ message: 'Post deleted successfully' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});