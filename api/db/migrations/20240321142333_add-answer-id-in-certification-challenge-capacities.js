const TABLE_NAME = 'certification-challenge-capacities';
const COLUMN_NAME = 'answerId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger(COLUMN_NAME).nullable().references('answers.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
