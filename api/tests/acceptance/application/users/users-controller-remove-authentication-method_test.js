const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
  knex,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | users-controller-remove-authentication-method', function () {
  describe.only('POST /admin/users/:id/remove-authentication', function () {
    it('should return 204', async function () {
      // given
      const server = await createServer();
      const user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: 'john.doe@example.net' });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
      const pixMaster = await insertUserWithRolePixMaster();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/remove-authentication`,
        payload: {
          data: {
            attributes: {
              type: 'USERNAME',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should set the username to null', async function () {
      // given
      const server = await createServer();
      const user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: 'john.doe@example.net' });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
      const pixMaster = await insertUserWithRolePixMaster();
      await databaseBuilder.commit();

      // when
      await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/remove-authentication`,
        payload: {
          data: {
            attributes: {
              type: 'USERNAME',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
      });

      // then
      const updatedUser = await knex('users').where({ id: user.id }).first();
      expect(updatedUser.username).to.be.null;
    });

    it('should remove PIX authenticationMethod', async function () {
      // given
      const server = await createServer();
      const user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: 'john.doe@example.net' });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
      const pixMaster = await insertUserWithRolePixMaster();
      await databaseBuilder.commit();

      // when
      await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/remove-authentication`,
        payload: {
          data: {
            attributes: {
              type: 'USERNAME',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
      });

      // then
      const pixAuthenticationMethod = await knex('authentication-methods')
        .where({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.PIX })
        .first();
      expect(pixAuthenticationMethod).to.be.undefined;
    });
  });
});
