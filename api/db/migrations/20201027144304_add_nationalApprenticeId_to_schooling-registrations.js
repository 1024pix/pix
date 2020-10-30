const TABLE_NAME = 'schooling-registrations';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string('nationalApprenticeId');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('nationalApprenticeId');
  });
};
