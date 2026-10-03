const TABLE_NAME_1 = 'sco_certification_results';
const TABLE_NAME_2 = 'certification_results';
const COLUMN_NAME = 'certification_issued_at';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME_1, function (table) {
    table.dateTime(COLUMN_NAME).defaultTo(null).comment('Date the certification was published and issued');
  });
  await knex.schema.table(TABLE_NAME_2, function (table) {
    table.dateTime(COLUMN_NAME).defaultTo(null).comment('Date the certification was published and issued');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME_1, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
  await knex.schema.table(TABLE_NAME_2, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
