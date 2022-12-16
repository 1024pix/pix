const TABLE_NAME = 'organizations';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('logoUrl');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.drop('logoUrl');
  });
};
