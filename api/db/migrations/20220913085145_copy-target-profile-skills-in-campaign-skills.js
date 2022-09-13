exports.up = function (knex) {
  return knex.raw(`
      INSERT INTO "campaign_skills" ("campaignId", "skillId")
      SELECT "campaigns"."id", "target-profiles_skills"."skillId"
      FROM "campaigns"
      JOIN "target-profiles" ON "target-profiles"."id" = "campaigns"."targetProfileId"
      JOIN "target-profiles_skills" ON "target-profiles_skills"."targetProfileId" = "target-profiles"."id"
   `);
};

exports.down = function (_knex) {};
