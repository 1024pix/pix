const TABLE_NAME = 'certification-center-memberships';
const COLUMN_NAME = 'updatedAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
