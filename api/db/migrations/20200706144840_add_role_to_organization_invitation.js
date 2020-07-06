const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'role';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.enu(COLUMN_NAME, ['MEMBER', 'ADMIN']);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
