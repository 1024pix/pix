const AuthenticationMethod = require('../../lib/domain/models/AuthenticationMethod');

exports.up = function(knex) {
  return knex.raw('INSERT INTO "authentication-methods"("userId", "externalIdentifier", "identityProvider") ' +
    'SELECT id AS "userId", "samlId" AS "externalIdentifier", \'GAR\' AS "identityProvider" FROM users WHERE "samlId" IS NOT NULL');
};

exports.down = async function(knex) {
  await knex.raw('UPDATE users SET "samlId" = ' +
    '(SELECT "externalIdentifier" FROM "authentication-methods" WHERE "authentication-methods"."userId" = users.id AND "authentication-methods"."identityProvider" = \'GAR\')');

  return await knex('authentication-methods').where({ identityProvider: AuthenticationMethod.identityProviders.GAR }).delete();
};
