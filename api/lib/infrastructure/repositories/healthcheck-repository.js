const settings = require('../../../lib/settings');
const knexConfig = require('../../../db/knexfile');
const knex = require('knex')(knexConfig[settings.environment]);

module.exports = {

  check() {
    return knex.raw('SELECT 1 FROM knex_migrations_lock');
  }

};

