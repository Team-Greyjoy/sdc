const Promise = require("bluebird");
const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  //user: process.env.PGUSER,
  host: process.env.PGREVIEWSHOST,
  database: process.env.PGREVIEWSDATABASE,
  password: process.env.PGREVIEWSPASS,
  port: process.env.PGREVIEWSPORT,
})

const db = Promise.promisifyAll(pool, {multiArgs: true});

module.exports = db;
