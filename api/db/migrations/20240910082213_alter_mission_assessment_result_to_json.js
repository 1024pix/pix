const TABLE_NAME = 'mission-assessments';
const COLUMN_NAME = 'result';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });

  await knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME);
  });
};

export { down, up };
