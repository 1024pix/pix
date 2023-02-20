const TABLE_NAME = 'certification-partner-acquisitions';
const COLUMN_NAME = 'acquired';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME);
  });

  await knex(TABLE_NAME).update(COLUMN_NAME, true);

  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).notNullable().alter();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
