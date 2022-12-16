const TABLE_NAME = 'schooling-registrations';
const COLUMN_NAME = 'birthdate';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).nullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).notNullable().alter();
  });
};
