const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'code';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).notNullable();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
