const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};
// Return post comments
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});
// Add comment to a post
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  //   Gives back either array or undefined
  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments;

  //   await axios.post('http://localhost:4005/events', {
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });
  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  const { postId, id, status, content } = data;
  if (type === 'CommentModerated') {
    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    // Event
    try {
      //   await axios.post('http://localhost:4005/events', {
      await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
          id,
          content,
          postId,
          status,
        },
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  console.log('Received Event', req.body.type);
  res.send({});
});
app.listen(4001, () => {
  console.log('Listening on 4001');
});
