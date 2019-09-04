require('dotenv').config();
const PgClient = require('../PgClient');
const PGSQL_DB_DO_NOT_EXIST_ERROR = '3D000';

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const url = new URL(dbUrl);

const DB_TO_DELETE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

const client = new PgClient(url.href);

client.query_and_log(`DROP DATABASE ${DB_TO_DELETE_NAME};`)
  .then(() => {
    console.log('Database dropped');
    client.end();
    process.exit(0);
  }).catch((error) => {
    if (error.code === PGSQL_DB_DO_NOT_EXIST_ERROR) {
      console.log(`Database ${DB_TO_DELETE_NAME} does not exist`);
      client.end();
      process.exit(0);
    }
    else {
      throw error;
    }
  });
