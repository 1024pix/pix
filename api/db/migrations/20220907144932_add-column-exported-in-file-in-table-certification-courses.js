const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'cpfFilename';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
