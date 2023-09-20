// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'type';

const formatAlterTableEnumSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '",
    )}'::text]));`,
  ].join('\n');
};

const up = async function up(knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(formatAlterTableEnumSql(TABLE_NAME, COLUMN_NAME, ['SCO', 'SUP', 'PRO', 'SCO-1D']));
};

const down = async function down(knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(formatAlterTableEnumSql(TABLE_NAME, COLUMN_NAME, ['SCO', 'SUP', 'PRO']));
};
export { up, down };
