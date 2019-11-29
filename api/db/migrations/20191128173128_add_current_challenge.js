const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'currentChallenge';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};
