const TABLE_NAME = 'assessment-results';
const COLUMN_NAME = 'commentByAutoJury';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.text(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
