const TABLE_NAME = 'schooling-registrations';
const COLUMN = 'isSupernumerary';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN);
  });
};

export { up, down };
