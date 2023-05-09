const TABLE_NAME = 'certification-courses';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('status');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('status');
  });
};

export { up, down };
