const TABLE_NAME = 'certification-challenges';
const DIFFICULTY_COLUMN_NAME = 'difficulty';
const DISCRIMINANT_COLUMN_NAME = 'discriminant';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.float(DIFFICULTY_COLUMN_NAME).defaultTo(null);
    table.float(DISCRIMINANT_COLUMN_NAME).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(DIFFICULTY_COLUMN_NAME);
    table.dropColumn(DISCRIMINANT_COLUMN_NAME);
  });
};

export { up, down };
