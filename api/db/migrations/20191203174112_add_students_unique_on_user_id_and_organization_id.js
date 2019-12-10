const TABLE_NAME = 'students';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);

  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};
