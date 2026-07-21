const TABLE_NAME = 'certification-subscriptions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.integer('complementaryCertificationId').references('complementary-certifications.id').notNullable();
    table.integer('certificationCandidateId').references('certification-candidates.id').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.text('type').notNull().defaultTo('COMPLEMENTARY');
    table.index('certificationCandidateId');
    table.index(['complementaryCertificationId', 'certificationCandidateId']);
  });
}
