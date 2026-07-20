const TABLE_NAME = 'tdb_num_back_to_school_campaigns_statistics';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('schoolUai');
    table.index('schoolUai');
    table.integer('schoolYear');
    table.string('academieName');
    table.string('schoolName');
    table.string('provinceCode');
    table.string('schoolYearGroup');
    table.string('competenceCode');
    table.string('competenceName');
    table.integer('participantCount');
    table.float('standardDeviation');
    table.float('firstDecileLevel');
    table.float('firstQuartileLevel');
    table.float('medianLevel');
    table.float('thirdQuartileLevel');
    table.float('ninthDecileLevel');
    table.float('averageMaxLevelReached');
    table.float('averageMaxLevelReachable');
    table.float('coverage');
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
