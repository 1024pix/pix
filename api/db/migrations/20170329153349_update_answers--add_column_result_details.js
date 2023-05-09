const TABLE_NAME = 'answers';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text('resultDetails');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('resultDetails');
  });
};

export { up, down };
