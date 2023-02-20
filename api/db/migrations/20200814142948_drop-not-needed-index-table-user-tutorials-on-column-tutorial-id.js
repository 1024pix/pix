const TABLE_NAME = 'user_tutorials';
const TUTORIALID_COLUMN = 'tutorialId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(TUTORIALID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(TUTORIALID_COLUMN);
  });
};
