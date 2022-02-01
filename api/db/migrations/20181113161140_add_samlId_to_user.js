const TABLE_NAME = 'users';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('samlId').unique();
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('samlId');
  });
};
