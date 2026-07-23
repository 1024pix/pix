const TABLE_NAME = 'certification-candidates';
const COLUMN_NAME = 'authorizedToStartAt';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (t) {
    t.dateTime(COLUMN_NAME)
      .nullable()
      .comment('Timestamp at which the invigilator authorized the candidate to start the certification test');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}
