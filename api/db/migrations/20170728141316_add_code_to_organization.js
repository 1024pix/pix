exports.up = function(knex) {
  return knex.schema.table('organizations', (table) => {
    table.string('code', 6).default('').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', (table) => {
    table.dropColumn('code');
  });
};
