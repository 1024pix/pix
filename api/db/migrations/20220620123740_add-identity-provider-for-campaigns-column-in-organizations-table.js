const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'identityProviderForCampaigns';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.string(COLUMN_NAME).nullable();
  });

  return knex.raw(
    'ALTER TABLE "organizations" ADD CONSTRAINT "organizations_identityProviderForCampaigns_check" CHECK ( "identityProviderForCampaigns" IN (\'POLE_EMPLOI\', \'CNAV\') )'
  );
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
