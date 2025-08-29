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
const TABLE_NAME = 'challenges';
const SCHEMA_NAME = 'learningcontent';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  for (let i = 0; i < 32; i++) {
    const tStatusColName = `t${i + 1}Status`;
    if (await knex.schema.withSchema(SCHEMA_NAME).hasColumn(TABLE_NAME, tStatusColName)) {
      await knex.schema.withSchema(SCHEMA_NAME).table(TABLE_NAME, function (table) {
        table.dropColumn(tStatusColName);
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    for (let i = 0; i < 32; i++) {
      const tStatusColName = `t${i + 1}Status`;
      table.boolean(tStatusColName);
    }
  });

  for (const challenge of await knex(TABLE_NAME).withSchema(SCHEMA_NAME).select('*')) {
    const fieldUpdate = {};
    for (let i = 0; i < 32; i++) {
      const fieldName = `t${i + 1}Status`;

      fieldUpdate[fieldName] = challenge.tStatus & (0b1 << i);
    }

    await knex(TABLE_NAME).withSchema(SCHEMA_NAME).update(fieldUpdate).where({ id: challenge.id });
  }
};

export { down, up };
