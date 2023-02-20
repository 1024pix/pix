const TABLE_NAME = 'complementary-certification-course-results';
const TEMPORARY_PARTNER_KEY_COLUMN_NAME = 'temporaryPartnerKey';

export const up = async function (knex) {
  await knex.raw(`
  INSERT INTO "complementary-certification-course-results" ("partnerKey", "complementaryCertificationCourseId", "acquired", "source")
    SELECT "partnerKey", "complementaryCertificationCourseId", "acquired", 'EXTERNAL'
    FROM "complementary-certification-course-results"
    WHERE "partnerKey" IS NOT NULL AND "temporaryPartnerKey" IS NOT NULL
    `);

  await knex.raw(`
    UPDATE "complementary-certification-course-results"
      SET "partnerKey" = "temporaryPartnerKey" 
      WHERE "partnerKey" IS NULL 
      AND "temporaryPartnerKey" IS NOT NULL
  `);

  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(TEMPORARY_PARTNER_KEY_COLUMN_NAME);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(TEMPORARY_PARTNER_KEY_COLUMN_NAME).references('badges.key').nullable();
  });
  await knex.raw(`
    UPDATE "complementary-certification-course-results" AS ccr_pix
      SET "temporaryPartnerKey" = ccr_pix."partnerKey", "partnerKey" = ccr_ext."partnerKey"
      FROM "complementary-certification-course-results" AS ccr_ext
      WHERE ccr_pix."source" = 'PIX' AND ccr_ext."source" = 'EXTERNAL'  
          AND ccr_pix."complementaryCertificationCourseId" = ccr_ext."complementaryCertificationCourseId"
  `);

  await knex.raw(`
    UPDATE "complementary-certification-course-results"
      SET "temporaryPartnerKey" = "partnerKey"
      WHERE "source" = 'PIX' 
      AND "partnerKey" IN (
        'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE',
        'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT',
        'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE',
        'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT'
      )
  `);

  await knex.raw(`
    DELETE FROM "complementary-certification-course-results"
      WHERE "source" = 'EXTERNAL' 
  `);
};
