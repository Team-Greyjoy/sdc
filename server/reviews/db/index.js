const Promise = require("bluebird");
const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  //user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASS,
  port: process.env.PGPORT,
})

const db = Promise.promisifyAll(pool, {multiArgs: true});

db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews (
  review_id BIGSERIAL,
  product_id INTEGER,
  rating INTEGER,
  summary TEXT,
  recommend BOOLEAN,
  response TEXT,
  body TEXT,
  reviewer_name VARCHAR,
  helpfulness INTEGER,
  report BOOLEAN
)`)
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Photos (
    photo_id BIGSERIAL,
    review_id INTEGER,
    url VARCHAR
  )`))
  .then(() => db.queryAsync(`CREATE TABLE IF NOT EXISTS Reviews_Chars (
    id BIGSERIAL,
    review_id INTEGER,
    char_id INTEGER,
    value INTEGER
  )`))

module.exports = db;
