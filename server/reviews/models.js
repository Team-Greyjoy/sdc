
module.exports = {

  getReviews: `SELECT
      Reviews.review_id,
      Reviews.rating,
      Reviews.summary,
      Reviews.recommend,
      Reviews.response,
      Reviews.body,
      to_timestamp(Reviews.date/1000) AS date,
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
    ORDER BY date / 1000 * $2 + helpfulness * 86400 * $3 DESC
  `,
  //86400=sec/day

  postReviews: `INSERT INTO Reviews (
    product_id,
    rating,
    summary,
    body,
    recommend,
    reviewer_name,
    reviewer_email
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7)
 `,

  reportReviews:`UPDATE Reviews
    SET report = true
    WHERE review_id = $1
 `,

  helpfulReviews: `UPDATE Reviews
    SET helpfulness = helpfulness + 1
    WHERE review_id = $1
 `,
}
