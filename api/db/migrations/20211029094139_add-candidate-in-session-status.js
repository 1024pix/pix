const TABLE_NAME = 'certification-candidates';
const TITLE_COLUMN = 'authorizedToStart';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(TITLE_COLUMN).notNullable().defaultTo(false);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};

export { up, down };
