const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isSupervisorAccessEnabled';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

// eslint-disable-next-line no-empty-function
const down = async function () {};
export { up, down };
