import { knex } from '../../../../../db/knex-database-connection.js';

const get = async function ({ name }) {
  return knex('issue-report-categories').where({ name }).first();
};

export { get };
