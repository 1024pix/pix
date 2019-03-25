const knexDatabaseConnection = require('../../db/knex-database-connection');

console.log('Emptying all tables...');
knexDatabaseConnection.emptyAllTables()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  });
