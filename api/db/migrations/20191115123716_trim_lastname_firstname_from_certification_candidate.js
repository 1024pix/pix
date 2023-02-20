export const up = async function (knex) {
  await knex.raw(`
      UPDATE "public"."certification-candidates"
      SET "firstName" = trim("firstName"),
          "lastName" = trim("lastName"),
          "birthCity" = trim("birthCity"),
          "birthCountry" = trim("birthCountry")
      WHERE id IN
          (SELECT "public"."certification-candidates"."id" AS "id"
           FROM "public"."certification-candidates"
           WHERE "public"."certification-candidates"."firstName" LIKE '% '
             OR "public"."certification-candidates"."lastName" LIKE '% '
             OR "public"."certification-candidates"."birthCity" LIKE '% '
             OR "public"."certification-candidates"."birthCountry" LIKE '% ' );
    `);
};

export const down = function () {
  // no rollback for this case
};
