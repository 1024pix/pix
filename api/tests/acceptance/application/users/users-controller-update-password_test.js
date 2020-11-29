const { expect, hFake, knex, databaseBuilder } = require('../../../test-helper');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-update-password', () => {

  const temporaryKey = 'good-temporary-key';

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser.withUnencryptedPassword({
      email: 'harry.cover@truc.so',
      rawPassword: 'Password2020',
    });
    await databaseBuilder.commit();
    await _insertPasswordResetDemand(temporaryKey, user.email);
  });

  afterEach(async () => {
    await knex('authentication-methods').delete();
    await knex('reset-password-demands').delete();
  });

  describe('Error case', () => {

    it('should reply with an error, when temporary key is invalid', async () => {
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

  describe('Success case', () => {

    const newPassword = 'Password2021';

    beforeEach(() => {
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

    it('should reply with 200 status code, when password is updated', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should authenticate user when password is updated', async () => {
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
      access_token = await authenticationController.authenticateUser(request, hFake);

      // then
      expect(access_token).to.ok;
    });
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
