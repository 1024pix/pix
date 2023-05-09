const TABLE_NAME = 'tutorial-evaluations';
const TUTORIALID_COLUMN = 'tutorialId';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(TUTORIALID_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(TUTORIALID_COLUMN);
  });
};

export { up, down };
