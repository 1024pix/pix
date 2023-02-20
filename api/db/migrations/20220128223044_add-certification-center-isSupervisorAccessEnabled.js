const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isSupervisorAccessEnabled';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
