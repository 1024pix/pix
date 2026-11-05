const TABLE_NAME = 'sco_certification_results';
const MIDDLE_NAME_COLUMN = 'middle_name';
const THIRD_NAME_COLUMN = 'third_name';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(MIDDLE_NAME_COLUMN).nullable().defaultTo(null).comment('Middle name of the candidate if exists');
    table.string(THIRD_NAME_COLUMN).nullable().defaultTo(null).comment('Third name of the candidate if exists');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(MIDDLE_NAME_COLUMN);
    table.dropColumn(THIRD_NAME_COLUMN);
  });
};

export { down, up };
