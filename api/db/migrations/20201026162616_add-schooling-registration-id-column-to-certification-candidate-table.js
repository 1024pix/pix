const TABLE_NAME = 'certification-candidates';
const COLUMN_NAME = 'schoolingRegistrationId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.integer(COLUMN_NAME).references('schooling-registrations.id');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
