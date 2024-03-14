// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
const TABLE_NAME = 'organization-learner-import-formats';

const up = async function (knex) {
  await knex.schema.raw(`CREATE TYPE "organization-learner-import-format-filetypes" AS ENUM ( 'csv',
	'xml');`);

  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('name').notNullable();
    table.specificType('fileType', '"organization-learner-import-format-filetypes"').notNullable();
    table.jsonb('config').notNullable();
    table.bigInteger('createdBy').notNullable().references('users.id');
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
  await knex.schema.raw(`DROP TYPE "organization-learner-import-format-filetypes";`);
};

export { down, up };
