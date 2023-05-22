const TABLE_NAME = 'certification-centers';
const UPDATED_AT_COLUMN = 'updatedAt';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(UPDATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
  });
};

export { up, down };
