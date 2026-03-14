const { Pool } = require("pg");
require("dotenv").config();

const db_password = process.env.POSTGRESQL_PASSWORD;
const db_host = process.env.HOST || "localhost";

const pool = new Pool({
    user: "postgres",
    host: db_host,
    database: "comment_system",
    password: db_password,
    port: 5432
});

module.exports = pool;