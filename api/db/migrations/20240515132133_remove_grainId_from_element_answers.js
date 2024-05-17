const TABLE_NAME = 'element-answers';
const COLUMN_NAME = 'grainId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME);
  });
};

export { down, up };
