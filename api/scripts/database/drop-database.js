require('dotenv').config();
const PgClient = require('../PgClient');

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const url = new URL(dbUrl);

const DB_TO_DELETE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

const client = new PgClient(url.href);

client.query_and_log(`DROP DATABASE ${DB_TO_DELETE_NAME};`)
  .then(() => {
    console.log('Database dropped');
    client.end();
    process.exit(0);
  });
