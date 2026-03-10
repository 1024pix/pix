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
export function builder(knex) {
  return [
    knex.schema.table('certification-candidates', function (table) {
      table.string('subscription', 50).comment('Enum value of Framework that candidate is subscribe to');
    }),
    knex.schema.table('certification-courses', function (table) {
      table.integer('versionId').comment('Active certification version at candidate reconciliation.');
      table.integer('candidateId').comment('link to certification candidate');
    }),
    knex.raw(`
      ALTER TABLE "certification-courses"
        ADD CONSTRAINT certification_courses_candidateid_foreign
          FOREIGN KEY ("candidateId")
            REFERENCES "certification-candidates" (id)
        NOT VALID
    `),
    knex.raw(`
    ALTER TABLE "certification-courses"
    ADD CONSTRAINT certification_courses_versionid_foreign
    FOREIGN KEY ("versionId")
    REFERENCES certification_versions(id)
    NOT VALID
`),
  ];
}

const up = async function (knex) {
  for (const request of builder(knex)) {
    await request;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table('certification-courses', function (table) {
    table.dropColumn('versionId');
    table.dropColumn('candidateId');
  });
  await knex.schema.table('certification-candidates', function (table) {
    table.dropColumn('subscription');
  });
};

export { down, up };
