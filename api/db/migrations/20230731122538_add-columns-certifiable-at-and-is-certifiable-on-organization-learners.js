// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
const TABLE_NAME = 'organization-learners';
const IS_CERTIFIABLE_COLUMN = 'isCertifiable';
const CERTIFIABLE_AT_COLUMN = 'certifiableAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(CERTIFIABLE_AT_COLUMN).defaultTo(null);
    table.boolean(IS_CERTIFIABLE_COLUMN).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(CERTIFIABLE_AT_COLUMN);
    table.dropColumn(IS_CERTIFIABLE_COLUMN);
  });
};

export { down, up };
