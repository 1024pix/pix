const TABLE_NAME = 'assessments';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('type');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('type');
  });
};

export { up, down };
