const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'maxReachableLevelOnCertificationDate';

export const up = async (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().defaultTo(5);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
