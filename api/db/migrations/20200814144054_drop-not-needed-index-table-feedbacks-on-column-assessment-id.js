const TABLE_NAME = 'feedbacks';
const ASSESSMENT_ID_COLUMN = 'assessmentId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ASSESSMENT_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ASSESSMENT_ID_COLUMN);
  });
};
