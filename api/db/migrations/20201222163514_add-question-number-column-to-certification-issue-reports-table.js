const TABLE_NAME = 'certification-issue-reports';
const COLUMN_NAME = 'questionNumber';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).unsigned();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
