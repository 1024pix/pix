const TABLE_NAME = 'organizations';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('email');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('email');
  });
};
