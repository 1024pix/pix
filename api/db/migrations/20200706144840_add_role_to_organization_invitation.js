const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'role';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.enu(COLUMN_NAME, ['MEMBER', 'ADMIN']);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
