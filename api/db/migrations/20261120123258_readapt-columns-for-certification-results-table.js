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
      .integer('v2ComplementaryVoletPixBadgeId')
      .comment('Complementary certification badge ID related to PixPlus V2 Certification (volet Pix)');
    table
      .boolean('v2ComplementaryVoletPixAcquired')
      .comment('Is Complementary certification badge ID level acquired (volet Pix)');
    table
      .integer('v2EduVoletExterneBadgeId')
      .comment('Complementary certification badge ID related to PixPlus V2 Certification (volet externe)');
    table
      .boolean('v2EduVoletExterneAcquired')
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
    table.dropColumn('v2ComplementaryVoletPixBadgeId');
    table.dropColumn('v2ComplementaryVoletPixAcquired');
    table.dropColumn('v2EduVoletExterneBadgeId');
    table.dropColumn('v2EduVoletExterneAcquired');
    table.string('eduV3ExternalJuryResult').comment('External result for EDU certifications, V3 only');
    table.jsonb('competenceMarks').comment('Array of object : { competenceId, level }');
  });
}
