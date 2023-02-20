const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isSupervisorAccessEnabled';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export const down = async function () {
  // do nothing.
};
