// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/EDTDT/pages/3849323922/Cr+er+une+migration

// If your migrations target :
//
// `answers`
// `knowledge-elements`
// `knowledge-element-snapshots`
//
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS certification_courses_candidateid_index
    ON "certification-courses"("candidateId");
`);
  await knex.raw(`
    ALTER TABLE "certification-courses"
    VALIDATE CONSTRAINT certification_courses_candidateid_foreign;
`);
  await knex.raw(`
    ALTER TABLE "certification-courses"
    VALIDATE CONSTRAINT certification_courses_versionid_foreign;
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.raw(`
    ALTER TABLE "certification-courses"
    DROP CONSTRAINT IF EXISTS certification_courses_versionid_foreign;
`);
  await knex.raw(`
    ALTER TABLE "certification-courses"
    ADD CONSTRAINT certification_courses_versionid_foreign
    FOREIGN KEY ("versionId")
    REFERENCES certification_versions(id)
    NOT VALID
`);
  await knex.raw(`
    ALTER TABLE "certification-courses"
    DROP CONSTRAINT IF EXISTS certification_courses_candidateid_foreign;
`);
  await knex.raw(`
    ALTER TABLE "certification-courses"
    ADD CONSTRAINT certification_courses_candidateid_foreign
    FOREIGN KEY ("candidateId")
    REFERENCES "certification-candidates"(id)
    NOT VALID
`);
  await knex.raw(`
    DROP INDEX IF EXISTS certification_courses_candidateid_index
`);
};

export { down, up };
