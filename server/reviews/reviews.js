const express = require('express');
require('dotenv').config();
const router = require('./routers.js');
const morgan = require('morgan');

const reviews = express();
const port = process.env.REVIEWSPORT || 5433;

reviews.use(express.json());
reviews.use(morgan('dev'));
reviews.use('/', router);

reviews.listen(port, () => {
  console.log(`Reviews listening on port ${port}`);
});