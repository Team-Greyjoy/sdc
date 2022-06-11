

module.exports = {

  getReviews: `SELECT
      Reviews.review_id,
      Reviews.rating,
      Reviews.summary,
      Reviews.recommend,
      Reviews.response,
      Reviews.body,
      to_timestamp(Reviews.date / 1000) AS date,
      Reviews.reviewer_name,
      Reviews.helpfulness AS helpfulness
    FROM Reviews
    WHERE product_id = $1
    ORDER BY date / 1000 * $2 + helpfulness * 864000 * $3 DESC`,

}

//86400=sec/day => 1day is weighted as 1 helpful, current ratio is 10 days to 1 helpful