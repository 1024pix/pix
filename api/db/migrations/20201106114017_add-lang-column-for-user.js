const TABLE_NAME = 'users';
const COLUMN_NAME = 'lang';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.string(COLUMN_NAME).notNullable().defaultTo('fr');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
