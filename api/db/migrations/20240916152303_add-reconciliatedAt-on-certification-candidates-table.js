const TABLE_NAME = 'certification-candidates';
const COLUMN_NAME = 'reconciliatedAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME).nullable().defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
