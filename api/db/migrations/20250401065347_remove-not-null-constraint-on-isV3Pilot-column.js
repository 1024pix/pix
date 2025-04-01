const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isV3Pilot';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table
      .boolean(COLUMN_NAME)
      .defaultTo(true)
      .nullable()
      .comment('DEPRECATED, this column will be unused soon')
      .alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNull().comment('').alter();
  });
};

export { down, up };
