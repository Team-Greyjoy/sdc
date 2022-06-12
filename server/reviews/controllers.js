const { getReviews, postReviews, reportReviews, helpfulReviews } = require("./models");
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
  get: function (req, res) {
    let {
      product_id,
      page,
      count,
      sort
    } = req.query;

    if(!product_id) {
      res.sendStatus(404);
    } else {
      page = page ? parseInt(page) : 1;
      count = count ? parseInt(count) : 5;
      if(sort === 'newest') {
        sort = {date: 1, helpfulness: 0}
      } else if (sort === 'helpful') {
        sort = {date: 0, helpfulness: 1}
      } else {
        sort = {date: 1, helpfulness: 10}
        //10 reviews to one day ratio for relevant sort
        //refactor later to divide by max
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
    const {
      product_id,
      rating,
      summary,
      body,
      recommend,
      name,
      email,
      photos,
      characteristics
    } = req.body;

    const query = {
      text: postReviews,
      values: [product_id, rating, summary, body, recommend, name, email]
    }
     db.queryAsync(query)
      .then((response) => {
        console.log(response);
        res.sendStatus(201);
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(404);
      })
  },

  meta: {
    get: function (req, res) {
      res.sendStatus(200);
    },
  },


  helpful: {
    put: function (req, res) {
      const { review_id } = req.params;
      const query = {
        text: helpfulReviews,
        values: [review_id]
      }
      db.queryAsync(query)
      .then((response) => {
        res.sendStatus(204);
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(404);
      })
    },
  },

  report: {
    put: function (req, res) {
      const { review_id } = req.params;
      const query = {
        text: reportReviews,
        values: [review_id]
      }
      db.queryAsync(query)
      .then((response) => {
        res.sendStatus(204);
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(404);
      })
    },
  },
}

