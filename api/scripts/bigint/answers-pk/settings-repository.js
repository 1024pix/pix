const { knex } = require('../../../db/knex-database-connection');

const isScheduled = async () => {
  const result = await knex.select('isScheduled').from('bigint-migration-settings').where('table', 'answers').first();
  if (!result) {
    throw new Error('No settings found in bigint-migration-settings');
  }
  return result.isScheduled;
};

const pauseInterval = async () => {
  const result = await knex
    .select('pauseMilliseconds')
    .from('bigint-migration-settings')
    .where('table', 'answers')
    .first();
  if (!result) {
    throw new Error('No settings found in bigint-migration-settings');
  }
  return result.pauseMilliseconds;
};

const migrationInterval = async () => {
  const result = await knex
    .select('startAt', 'endAt')
    .from('bigint-migration-settings')
    .where('table', 'answers')
    .first();
  return {
    startAt: result.startAt,
    endAt: result.endAt,
  };
};

const chunkSize = async () => {
  const result = await knex.select('chunkSize').from('bigint-migration-settings').where('table', 'answers').first();
  return result.chunkSize;
};

const markRowsAsMigrated = async (id) => {
  await knex.from('bigint-migration-settings').where('table', 'answers').update('startAt', id);
};

module.exports = {
  isScheduled,
  chunkSize,
  migrationInterval,
  markRowsAsMigrated,
  pauseInterval,
};
