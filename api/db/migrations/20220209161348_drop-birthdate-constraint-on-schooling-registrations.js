const TABLE_NAME = 'schooling-registrations';
const COLUMN_NAME = 'birthdate';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).nullable().alter();
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).notNullable().alter();
  });
};
