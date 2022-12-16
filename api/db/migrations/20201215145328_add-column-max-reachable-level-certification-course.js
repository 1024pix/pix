const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'maxReachableLevelOnCertificationDate';

exports.up = async (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().defaultTo(5);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
