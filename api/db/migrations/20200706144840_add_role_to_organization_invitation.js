const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'role';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.enu(COLUMN_NAME, ['MEMBER', 'ADMIN']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
