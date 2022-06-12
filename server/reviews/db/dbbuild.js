const Promise = require('bluebird');
const db = require('./index');
const pgtools = require('pgtools')
require('dotenv').config();

const config = {
  //user: 'postgres',
  password: process.env.PGREVIEWSPASS,
  port: process.env.PGREVIEWSPORT,
  host: process.env.PGREVIEWSHOST
}

const { dropdbAsync, createdbAsync} = Promise.promisifyAll(pgtools, {multiArgs: true});

dropdbAsync(config, process.env.PGREVIEWSDATABASE)
  .then(() => createdbAsync(config, process.env.PGREVIEWSDATABASE))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews (
    review_id SERIAL PRIMARY KEY,
    product_id SERIAL NOT NULL,
    rating INTEGER NOT NULL,
    date BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
    summary VARCHAR NULL DEFAULT NULL,
    body VARCHAR(1000) NULL DEFAULT NULL,
    recommend BOOLEAN NOT NULL,
    report BOOLEAN NOT NULL DEFAULT FALSE,
    reviewer_name VARCHAR NULL DEFAULT NULL,
    reviewer_email VARCHAR NULL DEFAULT NULL,
    response VARCHAR NULL DEFAULT NULL,
    helpfulness INTEGER NULL DEFAULT 0
  )`))
  .then(() => db.queryAsync(`COPY Reviews FROM '${process.env.REVIEWSDATA}' DELIMITER ',' csv HEADER NULL 'null'`))
  .then(() => db.queryAsync(`SELECT MAX(review_id) FROM Reviews`))
  .then((response) => db.queryAsync(`ALTER SEQUENCE Reviews_review_id_seq RESTART WITH ${response[0].rows[0].max + 1}`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Photos (
    photo_id SERIAL PRIMARY KEY,
    review_id SERIAL NOT NULL,
    url VARCHAR NOT NULL,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews_Chars (
    id SERIAL PRIMARY KEY,
    char_id SERIAL NOT NULL,
    review_id SERIAL NOT NULL,
    value INTEGER NOT NULL,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`COPY Photos FROM '${process.env.REVIEWSPHOTODATA}' DELIMITER ',' csv HEADER`))
  .then(() => db.queryAsync(`COPY Reviews_Chars FROM '${process.env.REVIEWSCHARSDATA}' DELIMITER ',' csv HEADER`))

  .then(() => db.queryAsync(`SELECT MAX(Photos.photo_id) AS max FROM Photos`))
  .then((response) => db.queryAsync(`ALTER SEQUENCE Photos_photo_id_seq RESTART WITH ${response[0].rows[0].max + 1}`))
  .then(() => db.queryAsync(`SELECT MAX(Reviews_Chars.id) AS max FROM Reviews_Chars`))
  .then((response) => db.queryAsync(`ALTER SEQUENCE Reviews_Chars_id_seq RESTART WITH ${response[0].rows[0].max + 1}`))
  .then(() => db.queryAsync(`CREATE INDEX pindex ON Photos (review_id)`))
  .then(() => db.queryAsync(`CREATE INDEX rcindex ON Reviews_Chars (review_id)`))
  .then(() => db.queryAsync(`CREATE INDEX rindex ON Reviews (review_id)`))
  .catch((e) => {
    console.log(e);
    res.sendStatus(404);
  })