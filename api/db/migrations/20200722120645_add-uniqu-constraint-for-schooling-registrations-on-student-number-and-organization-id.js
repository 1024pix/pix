const TABLE_NAME = 'schooling-registrations';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['studentNumber', 'organizationId']);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['studentNumber', 'organizationId']);
  });
};
