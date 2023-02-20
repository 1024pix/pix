const TABLE_NAME = 'users';
const COLUMN_NAME = 'externalIdentityId';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};
