require('dotenv').config();
const PgClient = require('../PgClient');

const url = new URL(process.env.DATABASE_URL);

const DB_TO_CREATE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

const client = new PgClient(url.href);

client.query_and_log(`CREATE DATABASE ${DB_TO_CREATE_NAME};`)
  .then(function() {
    console.log('Database created');
    client.end();
    process.exit(0);
  });
