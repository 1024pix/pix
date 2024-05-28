import { NON_OIDC_IDENTITY_PROVIDERS } from '../../src/identity-access-management/domain/constants/identity-providers.js';
const up = function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    'INSERT INTO "authentication-methods"("userId", "externalIdentifier", "identityProvider") ' +
      'SELECT id AS "userId", "samlId" AS "externalIdentifier", \'GAR\' AS "identityProvider" FROM users WHERE "samlId" IS NOT NULL',
  );
};

const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    'UPDATE users SET "samlId" = ' +
      '(SELECT "externalIdentifier" FROM "authentication-methods" WHERE "authentication-methods"."userId" = users.id AND "authentication-methods"."identityProvider" = \'GAR\')',
  );

  return await knex('authentication-methods')
    .where({ identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code })
    .delete();
};

export { down, up };
