// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
const TABLE_NAME = 'organization-learners';
const NEW_CONSTRAINT_NAME = 'one_active_sup_organization_learner';
const DELETEDAT_COLUMN = 'deletedAt';
const DELETEDBY_COLUMN = 'deletedBy';
const STUDENT_NUMBER_COLUMN = 'studentNumber';
const ORGANIZATIONID_COLUMN = 'organizationId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'studentNumber']);
  });

  return knex.raw(
    `CREATE UNIQUE INDEX :name: ON :table: (:studentNumber:, :organizationId: ) WHERE :deletedAt: IS NULL AND :deletedBy: IS NULL;`,
    {
      name: NEW_CONSTRAINT_NAME,
      table: TABLE_NAME,
      studentNumber: STUDENT_NUMBER_COLUMN,
      organizationId: ORGANIZATIONID_COLUMN,
      deletedAt: DELETEDAT_COLUMN,
      deletedBy: DELETEDBY_COLUMN,
    },
  );
};

const down = async function (knex) {
  await knex.raw(`DROP INDEX :name:;`, { name: NEW_CONSTRAINT_NAME });

  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'studentNumber']);
  });
};

export { up, down };
