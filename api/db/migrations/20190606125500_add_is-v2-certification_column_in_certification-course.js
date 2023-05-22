const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'isV2Certification';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
