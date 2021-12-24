exports.up = async function (knex) {
  await knex.schema.table('certification-courses', (table) => {
    table.string('birthCountry');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('certification-courses', (table) => {
    table.dropColumns('birthCountry');
  });
};
