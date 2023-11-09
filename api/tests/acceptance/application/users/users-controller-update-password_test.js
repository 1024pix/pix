import { expect, hFake, knex, databaseBuilder } from '../../../test-helper.js';
import { authenticationController } from '../../../../src/authentication/application/authentication-controller.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | users-controller-update-password', function () {
  const temporaryKey = 'good-temporary-key';

  let server;
  let user;
  let options;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser.withRawPassword({
      email: 'harry.cover@truc.so',
      rawPassword: 'Password2020',
    });
    await databaseBuilder.commit();
    await _insertPasswordResetDemand(temporaryKey, user.email);
  });

  describe('Error case', function () {
    it('should reply with an error, when temporary key is invalid', async function () {
      // given
      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/password-update?temporary-key=bad-temporary-key`,
        payload: {
          data: {
            id: user.id,
            attributes: {
              password: 'Password2021',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('Success case', function () {
    const newPassword = 'Password2021';

    beforeEach(function () {
      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/password-update?temporary-key=${temporaryKey}`,
        payload: {
          data: {
            id: user.id,
            attributes: {
              password: newPassword,
            },
          },
        },
      };
    });

    it('should reply with 200 status code, when password is updated', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should authenticate user when password is updated', async function () {
      // given
      await server.inject(options);

      const request = {
        payload: {
          grant_type: 'password',
          username: user.email,
          password: newPassword,
        },
      };
      let access_token = null;

      // when
      access_token = await authenticationController.createToken(request, hFake);

      // then
      expect(access_token).to.ok;
    });
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
