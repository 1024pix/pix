exports.up = async (knex) => {
  return knex.raw('INSERT INTO "authentication-methods" ("userId", "identityProvider", "authenticationComplement") ' +
    'SELECT id AS "userId", ' +
    '\'PIX\' AS "identityProvider", ' +
    'jsonb_build_object(\'password\', "password", \'shouldChangePassword\', "shouldChangePassword") AS "authenticationComplement" ' +
    'FROM users WHERE ("password" = \'\') IS FALSE');
};

exports.down = async (knex) => {
  const sqlRequest =
    'UPDATE users ' +
    'SET password = subquery.password, ' +
        '"shouldChangePassword" = subquery."shouldChangePassword" ' +

    'FROM ( ' +
      'SELECT ' +
        '"userId", ' +
        '"authenticationComplement" -> \'password\' AS password, ' +
        '("authenticationComplement" -> \'shouldChangePassword\')::boolean AS "shouldChangePassword" ' +
      'FROM "authentication-methods" ' +
      'WHERE "identityProvider" = \'PIX\' ' +
    ') AS subquery ' +

    'WHERE users.id = subquery."userId"; ';

  await knex.raw(sqlRequest);

  return knex.raw('DELETE FROM "authentication-methods" WHERE "identityProvider" = \'PIX\';');
};
