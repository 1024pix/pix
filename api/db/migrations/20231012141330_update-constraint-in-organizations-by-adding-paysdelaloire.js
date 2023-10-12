const TABLE_NAME = 'organizations';
const CONSTRAINT_NAME = 'organizations_identityProviderForCampaigns_check';
const COLUMN_NAME = 'identityProviderForCampaigns';

const up = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  return knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB', 'PAYSDELALOIRE') )`,
  );
};

const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  return knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB') )`,
  );
};

export { up, down };
