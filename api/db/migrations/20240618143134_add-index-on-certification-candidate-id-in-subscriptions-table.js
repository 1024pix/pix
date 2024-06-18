const TABLE_NAME = 'certification-subscriptions';
const COLUMN_NAME = 'certificationCandidateId';

const up = async function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => table.index(COLUMN_NAME));
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => table.dropIndex(COLUMN_NAME));
};

export { down, up };
