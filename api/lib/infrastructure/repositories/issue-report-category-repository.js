import { knex } from '../../../db/knex-database-connection';

export default {
  async get({ name }) {
    return knex('issue-report-categories').where({ name }).first();
  },
};
