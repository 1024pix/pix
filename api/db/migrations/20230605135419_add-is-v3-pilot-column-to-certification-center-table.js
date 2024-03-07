const TABLE_CERTIFICATION_CENTERS = 'certification-centers';
const COLUMN_IS_V3_PILOT = 'isV3Pilot';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_CERTIFICATION_CENTERS, function (table) {
    table.boolean(COLUMN_IS_V3_PILOT).defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_CERTIFICATION_CENTERS, function (table) {
    table.dropColumn(COLUMN_IS_V3_PILOT);
  });
};

export { down, up };
