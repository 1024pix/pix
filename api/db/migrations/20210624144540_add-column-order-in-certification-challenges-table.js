const TABLE_NAME = 'certification-challenges';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.integer('index').unsigned();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn('index');
  });
};
