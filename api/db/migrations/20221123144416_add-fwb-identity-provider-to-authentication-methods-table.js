export const up = async function (knex) {
  await knex.raw(
    'ALTER TABLE "authentication-methods" DROP CONSTRAINT "authentication_methods_identityProvider_check" '
  );
  return knex.raw(
    "ALTER TABLE \"authentication-methods\" ADD CONSTRAINT \"authentication_methods_identityProvider_check\" CHECK ( \"identityProvider\" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV', 'FWB') )"
  );
};

export const down = async function (knex) {
  await knex.raw(
    'ALTER TABLE "authentication-methods" DROP CONSTRAINT "authentication_methods_identityProvider_check" '
  );
  return knex.raw(
    "ALTER TABLE \"authentication-methods\" ADD CONSTRAINT \"authentication_methods_identityProvider_check\" CHECK ( \"identityProvider\" IN ('PIX', 'GAR', 'POLE_EMPLOI', 'CNAV') )"
  );
};
