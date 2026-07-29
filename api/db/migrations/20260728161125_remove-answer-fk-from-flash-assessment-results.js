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
const TABLE_NAME = 'flash-assessment-results';
const COLUMN_NAME = 'answerId';
const REF_TABLE_NAME = 'answers';
const REF_COLUMN_NAME = 'id';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.raw(
    'ALTER TABLE "flash-assessment-results" DROP CONSTRAINT IF EXISTS "flash_assessment_results_answerid_foreign";',
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.foreign(COLUMN_NAME).references(REF_COLUMN_NAME).inTable(REF_TABLE_NAME);
  });
}
