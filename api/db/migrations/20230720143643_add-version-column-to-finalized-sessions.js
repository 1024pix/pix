const TABLE_NAME = 'finalized-sessions';
const COLUMN_NAME = 'version';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME);
  });

  await knex(TABLE_NAME).update({ [COLUMN_NAME]: 2 });

  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
