const TABLE_NAME = 'men_dashboard_certification_dataset';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('schoolUai');
    table.index('schoolUai');
    table.smallint('schoolYear');
    table.string('academieName');
    table.string('schoolName');
    table.string('provinceCode');
    table.string('schoolYearGroup');
    table.integer('validatedCertificationCount');
    table.integer('certificationCount');
    table.float('averagePixScore');
    table.string('competenceCode');
    table.float('avgCompetenceLevel');
    table.date('updatedAt');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
