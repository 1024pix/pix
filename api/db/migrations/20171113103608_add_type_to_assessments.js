const TABLE_NAME = 'assessments';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('type');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('type');
  });
};
