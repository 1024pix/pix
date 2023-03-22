const TABLE_NAME = 'campaigns';

exports.up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.unique('code');
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('code');
  });
};
