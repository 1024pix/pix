const TABLE_NAME = 'certification_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('results');
    table.integer('maxReachableLevel');
    table.integer('reachedMeshIndex');
    table.integer('pixScore');
    table.jsonb('competenceMarks').comment('Array of object : { competenceId, level }');
    table.string('eduV3ExternalJuryResult').comment('External result for EDU certifications, V3 only');
    table.boolean('hasAcquiredClea').comment('True/false when ClÉa is acquired or not, NULL when CléA was not taken');
    table.integer('cleaBadgeId').comment('ID of complementary-certification-badge taken for CléA (le cas échéant)');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .jsonb('results')
      .comment(
        'Shape of results changes according to certification AlgorithmEngineVersion (1, 2 or 3). The code will handle the parsing',
      );
    table.dropColumn('maxReachableLevel');
    table.dropColumn('reachedMeshIndex');
    table.dropColumn('pixScore');
    table.dropColumn('competenceMarks');
    table.dropColumn('eduV3ExternalJuryResult');
    table.dropColumn('hasAcquiredClea');
    table.dropColumn('cleaBadgeId');
  });
}
