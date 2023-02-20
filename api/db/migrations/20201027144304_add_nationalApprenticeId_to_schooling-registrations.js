const TABLE_NAME = 'schooling-registrations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('nationalApprenticeId');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('nationalApprenticeId');
  });
};
