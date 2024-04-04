const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'lang';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
