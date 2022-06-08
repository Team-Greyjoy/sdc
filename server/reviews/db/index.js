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

module.exports = db;
