const TABLE_NAME = 'memberships';

exports.up = async (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};
