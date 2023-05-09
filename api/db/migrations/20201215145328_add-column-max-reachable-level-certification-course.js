const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'maxReachableLevelOnCertificationDate';

const up = async function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().defaultTo(5);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
