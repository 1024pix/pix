const TABLE_NAME = 'combined_courses';
const COLUMN_NAME = 'combinedCourseBlueprintId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(COLUMN_NAME)
      .notNullable()
      .comment(
        "Combined course blueprint used to create this combined course) - see 'combined_course_blueprints' table",
      )
      .alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(COLUMN_NAME)
      .nullable()
      .comment(
        "Combined course blueprint used to create this combined course) - see 'combined_course_blueprints' table",
      )
      .alter();
  });
};

export { down, up };
