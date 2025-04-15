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
const TABLE_NAME = 'passage-events';
const COLUMN_NAME = 'sequenceNumber';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.smallint(COLUMN_NAME).defaultTo(null).comment('Order in which events are emitted for a passage');
    table.unique(['passageId', 'sequenceNumber']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropUnique(['passageId', 'sequenceNumber']);
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
