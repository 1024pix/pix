const TABLE_NAME = 'schooling-registrations';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'nationalApprenticeId']);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'nationalApprenticeId']);
  });
};
