import { knex } from '../../test-helper.js';

function jobs(jobName) {
  return knex('pgboss.job').where({ name: jobName });
}

export { jobs };
