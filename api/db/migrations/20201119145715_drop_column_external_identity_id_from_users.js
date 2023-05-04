const TABLE_NAME = 'users';
const COLUMN_NAME = 'externalIdentityId';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};

export { up, down };
