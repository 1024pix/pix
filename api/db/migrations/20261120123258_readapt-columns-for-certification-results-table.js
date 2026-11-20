const TABLE_NAME = 'certification_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('eduV3ExternalJuryResult');
    table.dropColumn('competenceMarks');
    table.string('v3EduExternalJuryResult').comment('External result for EDU certifications, V3 only');
    table
      .integer('v2VoletPixBadgeId')
      .comment('Complementary certification badge ID related to PixPlus V2 Certification (volet Pix)');
    table.boolean('v2VoletPixAcquired').comment('Is Complementary certification badge ID level acquired (volet Pix)');
    table
      .integer('v2VoletExterneBadgeId')
      .comment('Complementary certification badge ID related to PixPlus V2 Certification (volet externe)');
    table
      .boolean('v2VoletExterneAcquired')
      .comment('Is Complementary certification badge ID level acquired (volet Externe)');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('v3EduExternalJuryResult');
    table.dropColumn('v2VoletPixBadgeId');
    table.dropColumn('v2VoletPixAcquired');
    table.dropColumn('v2VoletExterneBadgeId');
    table.dropColumn('v2VoletExterneAcquired');
    table.string('eduV3ExternalJuryResult').comment('External result for EDU certifications, V3 only');
    table.jsonb('competenceMarks').comment('Array of object : { competenceId, level }');
  });
}
