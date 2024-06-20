const TABLE_NAME = 'certification-candidates';
const COLUMN_NAME = 'hasSeenCertificationInstructions';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).defaultTo(false);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
