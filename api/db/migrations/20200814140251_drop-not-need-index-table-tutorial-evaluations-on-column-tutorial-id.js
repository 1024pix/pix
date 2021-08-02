const TABLE_NAME = 'tutorial-evaluations';
const TUTORIAL_ID_COLUMN = 'tutorialId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(TUTORIAL_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(TUTORIAL_ID_COLUMN);
  });
};
