const TABLE_NAME = 'sessions';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('accessCode');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('accessCode');
  });
};
