export const up = function (knex) {
  return knex.schema.table('schooling-registrations', (table) => {
    table.string('sex', 1);
  });
};

export const down = function (knex) {
  return knex.schema.table('schooling-registrations', function (table) {
    table.dropColumn('sex');
  });
};
