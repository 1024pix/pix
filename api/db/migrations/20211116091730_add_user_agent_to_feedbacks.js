exports.up = function (knex) {
  return knex.schema.table('feedbacks', function (table) {
    table.string('userAgent');
  });
};

exports.down = function (knex) {
  return knex.schema.table('feedbacks', (table) => {
    table.dropColumn('userAgent');
  });
};
