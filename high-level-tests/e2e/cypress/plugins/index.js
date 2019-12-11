const { knex } = require('../../../../api/db/knex-database-connection');
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = (on, config) => {
  config.env.AUTH_SECRET = process.env.AUTH_SECRET;

  on('file:preprocessor', cucumber());
  on('task', {
    async 'db:fixture' (data) {
      const file = require('../fixtures/' + data + '.json');

      for (const row of file) {
        await knex(data).insert(row);
      }

      return file;
    }
  });
  return config;
};

