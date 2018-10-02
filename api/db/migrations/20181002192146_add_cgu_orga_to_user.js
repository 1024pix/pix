const TABLE_NAME = 'users';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('cguOrga');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('cguOrga');
  });
};
