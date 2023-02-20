export const up = async function (knex) {
  await knex.raw(`
      UPDATE "public"."certification-courses" as cc
      SET "externalId" = joinCcAndCca."externalIdCertificationCandidate"
      FROM
      ( SELECT 
             cc."id" AS "idCertificationCourse",
             cca."externalId" AS "externalIdCertificationCandidate"
      FROM "public"."certification-courses" AS cc
      JOIN "public"."certification-candidates" AS cca ON cc."firstName" = cca."firstName"
      AND cc."lastName" = cca."lastName" AND cc."birthdate" = cca."birthdate"
      AND cc."sessionId" = cca."sessionId"
      WHERE cca."externalId" IS NOT NULL
        AND cc."externalId" IS  NULL ) as joinCcAndCca
        
      WHERE cc."id" = joinCcAndCca."idCertificationCourse";
    `);
};

export const down = function () {
  // no rollback for this case
};
