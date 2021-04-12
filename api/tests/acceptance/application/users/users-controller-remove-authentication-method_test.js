const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | users-controller-remove-authentication-method', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();
    user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: null });
    databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({ userId: user.id });
    databaseBuilder.factory.buildAuthenticationMethod({
      userId: user.id,
      identityProvider: AuthenticationMethod.identityProviders.GAR,
    });

    const pixMaster = await insertUserWithRolePixMaster();
    options = {
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
    };
    return databaseBuilder.commit();
  });

  describe('POST /admin/users/:id/remove-authentication', () => {

    it('should return 204', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should set the username to null', async () => {
      // when
      await server.inject(options);

      // then
      const updatedUser = await knex('users').where({ id: user.id }).first();
      expect(updatedUser.username).to.be.null;
    });

    it('should remove PIX authenticationMethod', async () => {
      // when
      await server.inject(options);

      // then
      const pixAuthenticationMethod = await knex('authentication-methods').where({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.PIX }).first();
      expect(pixAuthenticationMethod).to.be.undefined;
    });
  });
});
