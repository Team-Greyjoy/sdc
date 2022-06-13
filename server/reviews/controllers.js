const { getReviews, getPhotos, getRecAndRate, getChars, postReviews, reportReviews, helpfulReviews, postPhoto, postChar } = require("./models");
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
    let { product_id, page, count, sort } = req.query;

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
      };

      let response = {product: product_id};
      db.queryAsync(query)
        .then((reviews) => {
          response.page = pageCheck(page, reviews[0].rows.length, count);
          response.results = reviews[0].rows.slice((response.page - 1) * count, response.page * count);
          response.count = response.results.length;
          return Promise.all(response.results.map((review, i) =>
            db.queryAsync({text: getPhotos, values: [review.review_id]})))
        })
        .then((photos) => {
          photos.map((photo, i) => response.results[i].photos = photo[0].rows)
          res.status(200).send(response);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(404);
        })
    }
  },

  post: function (req, res) {
    const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
    const query = {
      text: postReviews,
      values: [product_id, rating, summary, body, recommend, name, email]
    }
     db.queryAsync(query)
      .then((response) => {
        const { review_id } = response[0].rows[0];
        if(photos && characteristics) {
          return Promise.all(photos.map((photo) => db.queryAsync({text: postPhoto, values: [review_id, photo]}))
            .concat(Object.keys(characteristics)
              .map((char_id) => db.queryAsync({text: postChar, values: [char_id, review_id, characteristics[char_id]]}))
            )
          )
        } else if (photos) {
          return Promise.all(photos.map((photo) => db.queryAsync({text: postPhoto, values: [review_id, photo]})))
        }
        else if (characteristics) {
          return Promise.all(Object.keys(characteristics)
          .map((char_id) => db.queryAsync({text: postChar, values: [char_id, review_id, characteristics[char_id]]})))
        }
      })
      .then(() => res.sendStatus(201))
      .catch((e) => {
        console.log(e);
        res.sendStatus(404);
      })
  },

  meta: {
    get: function (req, res) {
      const { product_id } = req.query;
      const queryRecAndRate = {text: getRecAndRate, values: [product_id]};
      const queryChars = {text: getChars, values: [product_id]};
      let response = { product_id };
      Promise.all([db.queryAsync(queryRecAndRate), db.queryAsync(queryChars)])
        .then((result) => {
          response = result[0][0].rows.reduce((acc, review) => {
            const recommend = review.recommend ? 1 : 0;
            response.recommended = {...acc.recommended, [recommend]: (acc[review.rating] || 0) + recommend}
            response.ratings = {...acc.ratings, [review.rating]: (acc[review.rating] || 0) + 1};
            return response;
          }, response);
          response.characteristics = {};
          result[1][0].rows.forEach((review, i) => {
            const { id, name } = review;
            if(!response.characteristics[name]) {
              response.characteristics[name] = { id, value: review.value, count: 1}
              return;
            }
            const { value, count } = response.characteristics[name];
            response.characteristics[name].value = Math.round((value * count + review.value) / (count + 1) * 1000) / 1000;
            response.characteristics[name].count = count + 1;
          });
          Object.keys(response.characteristics).forEach((key,i) => {
            delete response.characteristics[key].count;
          })
          res.status(200).send(response);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(404);
        })
    },
  },


  helpful: {
    put: function (req, res) {
      const { review_id } = req.params;
      const query = {text: helpfulReviews, values: [review_id]};
      db.queryAsync(query)
        .then((response) => res.sendStatus(204))
        .catch((e) => {
          console.log(e);
          res.sendStatus(404);
        })
    },
  },

  report: {
    put: function (req, res) {
      const { review_id } = req.params;
      const query = {text: reportReviews, values: [review_id]};
      db.queryAsync(query)
        .then((response) => res.sendStatus(204))
        .catch((e) => {
          console.log(e);
          res.sendStatus(404);
        })
    },
  },
}

