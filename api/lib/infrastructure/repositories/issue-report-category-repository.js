const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async get({ name }) {
    return knex('issue-report-categories').where({ name }).first();
  },
};
