const PgClient = require('../PgClient');

const client = new PgClient(process.env.DATABASE_URL);

const DB_TO_CREATE_NAME = 'pix';

client.query_and_log(`CREATE DATABASE ${DB_TO_CREATE_NAME};`)
  .then(function() {
    console.log('Database created');
    client.end();
  })
  .then(() => {
    console.log('END');
    process.exit(0);
  });
