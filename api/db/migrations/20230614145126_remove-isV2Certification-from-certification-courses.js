const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'isV2Certification';
const VERSION_COLUMN_NAME = 'version';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });

  await knex(TABLE_NAME).update(COLUMN_NAME, true).where(VERSION_COLUMN_NAME, 2);
};

export { down, up };
