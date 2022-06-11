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
    date BIGINT NOT NULL,
    summary VARCHAR NULL DEFAULT NULL,
    body VARCHAR(1000) NULL DEFAULT NULL,
    recommend BOOLEAN NOT NULL,
    report BOOLEAN NOT NULL,
    reviewer_name VARCHAR NULL DEFAULT NULL,
    reviewer_email VARCHAR,
    response VARCHAR NULL DEFAULT NULL,
    helpfulness INTEGER NULL DEFAULT NULL
  )`))
  .then(() => db.queryAsync(`COPY Reviews FROM '${process.env.REVIEWSDATA}' DELIMITER ',' csv HEADER NULL 'null'`))
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