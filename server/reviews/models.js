

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
      Reviews.helpfulness AS helpfulness,
      photoarray.photosl AS photos
    FROM Reviews, LATERAL (
        SELECT ARRAY(
          SELECT json_build_object('id', Photos.photo_id, 'url', Photos.url)
          FROM Photos
          WHERE Photos.review_id = Reviews.review_id
        ) AS photosl
    ) photoarray
    WHERE Reviews.product_id = $1 AND Reviews.report = false
    ORDER BY date / 1000 * $2 + helpfulness * 864000 * $3 DESC
    `,

  postReviews: `

  `
}

//86400=sec/day => 1day is weighted as 1 helpful, current ratio is 10 days to 1 helpful