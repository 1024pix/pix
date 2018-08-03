const PgClient = require('../PgClient');

const client = new PgClient(process.env.DATABASE_URL);

const DB_TO_DELETE_NAME = 'pix';

client.query_and_log(`DROP DATABASE ${DB_TO_DELETE_NAME};`)
  .then(function() {
    console.log('Database dropped');
    client.end();
  })
  .then(() => {
    console.log('END');
    process.exit(0);
  });
