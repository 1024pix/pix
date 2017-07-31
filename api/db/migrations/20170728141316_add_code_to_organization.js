exports.up = function(knex) {
  return knex.schema.table('organizations', function (table) {
    table.string('code', 6).default('').unique().notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', (table) => {
    table.dropColumn('code');
  });
};
