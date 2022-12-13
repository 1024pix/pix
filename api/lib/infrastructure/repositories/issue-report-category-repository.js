const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async get({ name }) {
    return knex('issue-report-categories').where({ name }).first();
  },
};
