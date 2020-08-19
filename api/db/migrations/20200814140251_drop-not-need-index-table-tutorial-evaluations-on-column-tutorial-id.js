const TABLE_NAME = 'tutorial-evaluations';
const TUTORIALID_COLUMN = 'tutorialId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(TUTORIALID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(TUTORIALID_COLUMN);
  });
};
