const TABLE_NAME = 'schooling-registrations';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isSupernumerary');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isSupernumerary');
  });
};

export { up, down };
