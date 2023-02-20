const TABLE_NAME = 'schooling-registrations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isSupernumerary');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isSupernumerary');
  });
};
