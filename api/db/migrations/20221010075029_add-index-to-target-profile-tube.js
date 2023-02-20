const TABLE_NAME = 'target-profile_tubes';
const COLUMN_NAME = 'targetProfileId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(COLUMN_NAME);
  });
};
