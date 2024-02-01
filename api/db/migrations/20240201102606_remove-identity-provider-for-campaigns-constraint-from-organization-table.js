const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'identityProviderForCampaigns';
const CONSTRAINT_NAME = 'organizations_identityProviderForCampaigns_check';

const up = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
};

const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB', 'PAYSDELALOIRE') )`,
  );
};

export { up, down };
