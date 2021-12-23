const TABLE_NAME = 'feedbacks';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('email');
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('email');
  });
};
