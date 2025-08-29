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
const COLUMN_NAME = 'tStatus';
const SCHEMA_NAME = 'learningcontent';

function toMask(num) {
  return num.toString(2).padStart(32, '0');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).table(TABLE_NAME, function (table) {
    table
      .specificType(COLUMN_NAME, 'BIT(32)')
      .defaultTo(knex.raw("B'00000000000000000000000000000000'"))
      .comment('tStatus bitmask');
  });

  for (const challenge of await knex(TABLE_NAME).withSchema(SCHEMA_NAME).select('*')) {
    let tStatus = 0b0;
    for (let i = 0; i < 32; i++) {
      const fieldName = `t${i}Status`;
      if (fieldName in challenge && challenge[fieldName]) {
        tStatus |= 0b1 << i;
      }
    }
    await knex(TABLE_NAME)
      .withSchema(SCHEMA_NAME)
      .update({
        // eslint-disable-next-line knex/avoid-injections
        tStatus: knex.raw(`B'${toMask(tStatus)}'`),
      })
      .where({ id: challenge.id });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
