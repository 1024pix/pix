const TABLE_NAME = 'authentication-methods';
const CONSTRAINT_NAME = 'authentication_methods_identityProvider_check';

const up = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  return knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "identityProvider" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB', 'PAYSDELALOIRE', 'GOOGLE') )`,
  );
};

const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  // eslint-disable-next-line knex/avoid-injections -- Safe operation - the string is interpolated with a constant.
  return knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "identityProvider" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB', 'PAYSDELALOIRE') )`,
  );
};

export { up, down };
