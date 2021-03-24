const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('type');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('type');
  });
};
