const TABLE_NAME = 'knowledge-elements';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('pixScore');
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('pixScore');
  });
};
