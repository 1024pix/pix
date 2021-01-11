const TABLE_NAME = 'target-profiles';
const OLD_COLUMN_NAME = 'organizationId';
const NEW_COLUMN_NAME = 'ownerOrganizationId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};
