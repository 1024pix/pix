const TABLE_CERTIFICATION_COURSES = 'certification-courses';
const COLUMN_IS_V3 = 'isV3';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_CERTIFICATION_COURSES, function (table) {
    table.boolean(COLUMN_IS_V3).defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_CERTIFICATION_COURSES, function (table) {
    table.dropColumn(COLUMN_IS_V3);
  });
};

export { up, down };
