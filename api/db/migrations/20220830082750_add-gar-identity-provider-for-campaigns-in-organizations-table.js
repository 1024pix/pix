exports.up = async function (knex) {
  await knex.raw('ALTER TABLE "organizations" DROP CONSTRAINT "organizations_identityProviderForCampaigns_check" ');
  return knex.raw(
    'ALTER TABLE "organizations" ADD CONSTRAINT "organizations_identityProviderForCampaigns_check" CHECK ( "identityProviderForCampaigns" IN (\'POLE_EMPLOI\', \'CNAV\', \'GAR\') )'
  );
};

exports.down = async function (knex) {
  await knex.raw('ALTER TABLE "organizations" DROP CONSTRAINT "organizations_identityProviderForCampaigns_check" ');
  return knex.raw(
    'ALTER TABLE "organizations" ADD CONSTRAINT "organizations_identityProviderForCampaigns_check" CHECK ( "identityProviderForCampaigns" IN (\'POLE_EMPLOI\', \'CNAV\') )'
  );
};
