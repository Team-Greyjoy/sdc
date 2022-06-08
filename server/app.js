// NOTE ABOUT NODE-FETCH VERSION
// You can use the classic require statement if you use an older version of node-fetch
// Namely, if you have "node-fetch" : "^2.6.6"
// const fetch = require('node-fetch');

// Otherwise, do yarn add node-fetch and use the line below from their docs:
// https://www.npmjs.com/package/node-fetch

// Either way works, but makes sense to go with the new version
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const reviews = require("./reviews/reviewControllers");

app.use(express.json());

app.use(express.static('public'));

// I had to yarn build and yarn serve to get this to work
// Remember to include PORT='8080' in your .env file unless you want port 3000


// ------------------------------------------------------------
// -------------------------- Routes --------------------------
// ------------------------------------------------------------

// Related Products
app.get('/related/:id', (req, res) => {
  fetch(`${process.env.URL}/products/${req.params.id}/related`, {
    headers: {
      Authorization: process.env.GITTOKEN,
      'User-Agent': 'user',
    },
  })
    .then((response) => response.json())
    .then((results) => res.send(results));
});

// General product endpoint
app.get('/product/:id', (req, res) => {
  fetch(`${process.env.URL}/products/${req.params.id}`, {
    headers: {
      Authorization: process.env.GITTOKEN,
      'User-Agent': 'user',
    },
  })
    .then((response) => response.json())
    .then((results) => res.send(results));
});

// Style endpoint for product
app.get('/style/:id', (req, res) => {
  fetch(`${process.env.URL}/products/${req.params.id}/styles`, {
    headers: {
      Authorization: process.env.GITTOKEN,
      'User-Agent': 'user',
    },
  })
    .then((response) => response.json())
    .then((results) => res.send(results));
});

// Reviews Meta for product
app.get('/review/:id', (req, res) => {
  // fetch(`${process.env.URL}/reviews/meta?product_id=${req.params.id}`, {
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  // })
  //   .then((response) => response.json())
  //   .then((results) => res.send(results));
});

// Other Reviews
app.get('/review/:id/:page/:count/:sort', (req, res) => {
  // fetch(`${process.env.URL}/reviews?product_id=${req.params.id}&page=${req.params.page}&count=${req.params.count}&sort=${req.params.sort}`, {
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  // })
  //   .then((response) => response.json())
  //   .then((results) => res.send(results));
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  // fetch(`${process.env.URL}/reviews/${req.params.review_id}/helpful`, {
  //   method: 'PUT',
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  // })
  //   .then((results) => res.send(results));
});

app.put('/reviews/:review_id/report', (req, res) => {
  // fetch(`${process.env.URL}/reviews/${req.params.review_id}/report`, {
  //   method: 'PUT',
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  // })
  //   .then((results) => res.send(results));
});

app.post('/reviews', (req, res) => {
  // fetch(`${process.env.URL}/reviews`, {
  //   method: 'POST',
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  //   body: JSON.stringify(req.body.data),
  // })
  //   .then((results) => res.send(results));
});

// Questions
app.get('/review/:id', (req, res) => {
  // fetch(`${process.env.URL}/qa/questions?product_id=${req.params.id}&count=1000`, {
  //   headers: {
  //     Authorization: process.env.GITTOKEN,
  //     'User-Agent': 'user',
  //   },
  // })
  //   .then((response) => response.json())
  //   .then((results) => res.send(results));

});

//Overview
app.post('/cart', (req, res) => {
  fetch(`${process.env.URL}/cart`, {
    method: 'POST',
    headers: {
      Authorization: process.env.GITTOKEN,
      'content-type': 'application/json',
    },
    body: JSON.stringify(req.body),
  })
    .then((results) => res.send(results));
});

app.post('/tester', (req, res) => {
  res.send(req.body)
})

app.listen(port, () => {
  console.log(`Spooder listening on port ${port}`);
});