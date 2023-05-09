const TABLE_NAME = 'schooling-registrations';
const COLUMN_NAME = 'birthdate';

const up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).nullable().alter();
  });
};

const down = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(COLUMN_NAME).notNullable().alter();
  });
};

export { up, down };
