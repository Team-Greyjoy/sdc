
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
      Reviews.helpfulness AS helpfulness
    FROM Reviews
    WHERE Reviews.product_id = $1 AND Reviews.report = false
    ORDER BY date / 1000 * $2 + helpfulness * 86400 * $3 DESC
  `,
  //86400=sec/day

  getPhotos: ` SELECT
      Photos.photo_id AS id,
      Photos.url
    FROM Photos
    WHERE Photos.review_id = $1
  `,

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
  RETURNING review_id
 `,

  postPhoto: `INSERT INTO Photos (
    review_id,
    url
  )
  VALUES ($1, $2)
  `,

  postChar: `INSERT INTO Reviews_Chars (
    char_id,
    review_id,
    value
  )
  VALUES ($1, $2, $3)
  `,

  reportReviews: `UPDATE Reviews
    SET report = true
    WHERE review_id = $1
 `,

  helpfulReviews: `UPDATE Reviews
    SET helpfulness = helpfulness + 1
    WHERE review_id = $1
 `,
}

//photoarray.photosl AS photos
// , LATERAL (
//   SELECT ARRAY(
//     SELECT json_build_object('id', Photos.photo_id, 'url', Photos.url)
//     FROM Photos
//     WHERE Photos.review_id = Reviews.review_id
//   ) AS photosl
// ) photoarray