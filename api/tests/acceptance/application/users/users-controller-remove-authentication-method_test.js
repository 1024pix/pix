import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper';

import createServer from '../../../../server';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';

describe('Acceptance | Controller | users-controller-remove-authentication-method', function () {
  let server;
  let user;
  let options;

  beforeEach(async function () {
    server = await createServer();
    user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: null });
    databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
      userId: user.id,
    });
    databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

    const superAdmin = await insertUserWithRoleSuperAdmin();
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
      headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
    };
    return databaseBuilder.commit();
  });

  describe('POST /admin/users/:id/remove-authentication', function () {
    it('should return 204', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should set the username to null', async function () {
      // when
      await server.inject(options);

      // then
      const updatedUser = await knex('users').where({ id: user.id }).first();
      expect(updatedUser.username).to.be.null;
    });

    it('should remove PIX authenticationMethod', async function () {
      // when
      await server.inject(options);

      // then
      const pixAuthenticationMethod = await knex('authentication-methods')
        .where({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.PIX })
        .first();
      expect(pixAuthenticationMethod).to.be.undefined;
    });
  });
});
