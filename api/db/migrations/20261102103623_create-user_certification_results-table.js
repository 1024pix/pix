const TABLE_NAME = 'user_certification_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.uuid('certificationResultId').primary().references('certification_results.id');
    table.integer('userId').notNullable().references('users.id');
    table.integer('sessionId').nullable().references('sessions.id');
    table.integer('certificationCourseId').nullable().references('certification-courses.id');

    table.index('sessionId');
    table.index('certificationCourseId');
    table.index('userId');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
