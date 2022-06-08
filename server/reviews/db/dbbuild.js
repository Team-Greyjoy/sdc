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
    review_id BIGSERIAL,
    product_id INTEGER,
    rating INTEGER,
    date INTEGER,
    summary TEXT,
    body TEXT,
    recommend BOOLEAN,
    report BOOLEAN,
    reviewer_name VARCHAR,
    reviewer_email VARCHAR,
    response TEXT,
    helpfulness INTEGER
  )`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Photos (
    photo_id BIGSERIAL,
    review_id BIGSERIAL,
    url VARCHAR,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews_Chars (
    id BIGSERIAL,
    char_id INTEGER,
    review_id INTEGER,
    value INTEGER,
    CONSTRAINT fk_review
      FOREIGN KEY(review_id)
	      REFERENCES Reviews(review_id)
  )`))
  .then(() => db.queryAsync(`COPY Reviews FROM '/Users/jasonmatta/Documents/HackReactorSEI/sdc/server/_data/reviews.csv' WITH (FORMAT csv, header)`))
  .then(() => db.queryAsync(`COPY Photos FROM '/Users/jasonmatta/Documents/HackReactorSEI/sdc/server/_data/reviews_photos.csv' WITH (FORMAT csv, header)`))
  .then(() => db.queryAsync(`COPY Reviews_Chars FROM '/Users/jasonmatta/Documents/HackReactorSEI/sdc/server/_data/characteristic_reviews.csv' WITH (FORMAT csv, header)`))