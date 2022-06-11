const { getReviews } = require("./models");
const db = require('./db');
const express = require('express');

//helpers
const pageCheck = function(page, length, count) {
  if((page - 1) * count >= length) {
    return Math.ceil(length/count);
  } else {
    return page;
  }
}

module.exports = {
  get: function ({ query: { product_id, page, count, sort } }, res) {
    if(!product_id) {
      res.sendStatus(404);
    } else {
      page = parseInt(page) || 1;
      count = parseInt(count) || 5;
      if(sort === 'newest') {
        sort = {date: 1, helpfulness: 0}
      } else if (sort === 'helpful') {
        sort = {date: 0, helpfulness: 1}
      } else {
        sort = {date: 1, helpfulness: 1}
      }

      const query = {
        text: getReviews,
        values: [product_id, sort.date, sort.helpfulness]
      }

      db.queryAsync(query)
        .then((results) => {
          let newPage = pageCheck(page, results[0].rows.length, count);
          results = results[0].rows.slice((newPage - 1) * count, newPage * count);
          res.status(200).send({product: product_id, page: newPage, count: results.length, results});
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(404);
        })
    }
  },

  post: function (req, res) {
    res.sendStatus(201);
  },

  meta: {
    get: function (req, res) {
      res.sendStatus(200);
    },
  },


  helpful: {
    put: function (req, res) {
      res.sendStatus(202);
    },
  },

  report: {
    put: function (req, res) {
      res.sendStatus(202);
    },
  },
}

