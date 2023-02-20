const TABLE_NAME = 'assessments';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('estimatedLevel');
    table.integer('pixScore');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('estimatedLevel');
    table.dropColumn('pixScore');
  });
};
