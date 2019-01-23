const { knex } = require('../../../db/knex-database-connection');

module.exports = {

  check() {
    return knex.raw('SELECT 1 FROM knex_migrations_lock');
  }

};

