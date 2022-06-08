const Promise = require('bluebird');
const db = require('./index');
const pgtools = require('pgtools')
require('dotenv').config();

const config = {
  //user: 'postgres',
  password: process.env.PGPASS,
  port: process.env.PGPORT,
  host: process.env.PGHOST
}

const { dropdbAsync, createdbAsync} = Promise.promisifyAll(pgtools, {multiArgs: true});

dropdbAsync(config, process.env.PGDATABASE)
  .then(() => createdbAsync(config, process.env.PGDATABASE))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews (
    review_id BIGSERIAL PRIMARY KEY,
    product_id BIGSERIAL NOT NULL,
    rating INTEGER,
    date BIGSERIAL,
    summary TEXT,
    body TEXT,
    recommend BOOLEAN,
    report BOOLEAN,
    reviewer_name VARCHAR,
    reviewer_email VARCHAR,
    response TEXT,
    helpfulness INTEGER
  )`))
  .then(() => db.queryAsync(`COPY Reviews FROM '${process.env.REVIEWSDATA}' WITH (FORMAT csv, header)`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Photos (
    photo_id BIGSERIAL PRIMARY KEY,
    review_id BIGSERIAL NOT NULL,
    url VARCHAR,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews_Chars (
    id BIGSERIAL PRIMARY KEY,
    char_id BIGSERIAL NOT NULL,
    review_id BIGSERIAL NOT NULL,
    value INTEGER,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`COPY Photos FROM '${process.env.REVIEWSPHOTODATA}' WITH (FORMAT csv, header)`))
  .then(() => db.queryAsync(`COPY Reviews_Chars FROM '${process.env.REVIEWSCHARSDATA}' WITH (FORMAT csv, header)`))