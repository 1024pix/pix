require('dotenv').config();
const PgClient = require('../PgClient');
const { PGSQL_DUPLICATE_DATABASE_ERROR } = require('../../db/pgsql-errors');

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const url = new URL(dbUrl);

const DB_TO_CREATE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

const client = new PgClient(url.href);

client.query_and_log(`CREATE DATABASE ${DB_TO_CREATE_NAME};`)
  .then(function() {
    console.log('Database created');
    client.end();
    process.exit(0);
  }).catch((error) => {
    if (error.code === PGSQL_DUPLICATE_DATABASE_ERROR) {
      console.log(`Database ${DB_TO_CREATE_NAME} already created`);
      client.end();
      process.exit(0);
    }
    else {
      throw error;
    }
  });
