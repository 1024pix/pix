const { knex } = require('../../../db/knex-database-connection');

const isScheduled = async () => {
  const result = await knex.select('isScheduled').from('bigint-migration-settings').first();
  return result.isScheduled;
};

const settings = async () => {
  const result = await knex.select('chunkSize').from('bigint-migration-settings').first();
  return { chunkSize: result.chunkSize };
};

module.exports = {
  isScheduled,
  settings,
};
