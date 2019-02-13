const knexDatabaseConnection = require('../../db/knex-database-connection');

console.log('Empty all tables...');
knexDatabaseConnection.emptyAllTables()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  });
