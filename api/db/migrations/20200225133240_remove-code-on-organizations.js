const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'code';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME, 6).default('').notNullable();
  });
};

export { up, down };
