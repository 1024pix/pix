const {
  databaseBuilder,
  expect,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('Acceptance | Route | Account-recovery', () => {

  describe('PATCH /api/users/{id}/account-recovery', () => {

    it('should return 204 HTTP status codes', async () => {
      // given
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = true;

      const temporaryKey = 'DJFKDKJJSHQJ';
      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const password = 'password123#A*';
      const user = databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({ userId, temporaryKey, newEmail, used: false });
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/account-recovery`,
        payload: {
          data: {
            attributes: {
              email: newEmail,
              password,
              'temporary-key': accountRecoveryDemand.temporaryKey,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 if IS_SCO_ACCOUNT_RECOVERY_ENABLED is not enabled', async () => {
      // given
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = false;

      const temporaryKey = 'AZERFJJSHQJ';
      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const password = 'password123#A*';
      const user = databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({ userId, temporaryKey, newEmail, used: false });
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/account-recovery`,
        payload: {
          data: {
            attributes: {
              email: newEmail,
              password,
              'temporary-key': accountRecoveryDemand.temporaryKey,
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

});
