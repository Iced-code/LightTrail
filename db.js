const { Pool } = require("pg");
require("dotenv").config();

const db_password = process.env.POSTGRESQL_PASSWORD;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "comment_system",
    password: db_password,
    port: 5432
});

module.exports = pool;