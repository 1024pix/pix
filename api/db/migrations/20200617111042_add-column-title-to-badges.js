const TABLE_NAME = 'badges';
const TITLE_COLUMN = 'title';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(TITLE_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};

export { up, down };
