const TABLE_NAME = 'campaign-participations';
const REFERENCE_TABLE_NAME = 'schooling-registrations';
const COLUMN_NAME = 'schoolingRegistrationId';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).references(`${REFERENCE_TABLE_NAME}.id`).defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
