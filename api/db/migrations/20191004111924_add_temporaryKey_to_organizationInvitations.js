const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'temporaryKey';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
