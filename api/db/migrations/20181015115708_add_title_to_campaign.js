const TABLE_NAME = 'campaigns';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('title');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('title');
  });
};
