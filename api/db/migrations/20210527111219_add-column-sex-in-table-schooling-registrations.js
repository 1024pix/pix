exports.up = function (knex) {
  return knex.schema.table('schooling-registrations', (table) => {
    table.string('sex', 1);
  });
};

exports.down = function (knex) {
  return knex.schema.table('schooling-registrations', function (table) {
    table.dropColumn('sex');
  });
};
