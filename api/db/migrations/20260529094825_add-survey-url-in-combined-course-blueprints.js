const TABLE_NAME = 'combined_course_blueprints';
const COLUMN_NAME = 'surveyUrl';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .string(COLUMN_NAME)
      .defaultTo(null)
      .comment("Url for the blueprint's survey displayed at the end of related combined courses");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
