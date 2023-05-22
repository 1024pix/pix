const TABLE_NAME = 'user-saved-tutorials';
const COLUMN_NAME = 'skillId';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).defaultTo(null);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
