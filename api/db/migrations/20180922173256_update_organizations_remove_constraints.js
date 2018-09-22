exports.up = function(knex) {
  return knex.schema.table('organizations', (table) => {
    table.string('email').nullable.alter();
  });
};

exports.down = function(knex) {
  return knex.schema.table('organizations', (table) => {
    table.string('email').notNullable().alter();
  });
};
