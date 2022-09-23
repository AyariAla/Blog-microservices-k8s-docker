const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());
const axios = require('axios');
const { log } = require('console');
const posts = {};

// app.get('/posts', (req, res) => {
//   res.send(posts);
// });
// app.set('port', process.env.PORT || 3002);
app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };
  try {
    await axios.post('http://event-bus-srv:4005/events', {
      // await axios.post('http://localhost:4005/events', {
      type: 'PostCreated',
      data: {
        id,
        title,
      },
    });
  } catch (error) {
    console.log(error.message);
  }

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log('v 0.0.4');
  console.log('Listening on 4000');
});
