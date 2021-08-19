const {
  databaseBuilder,
  expect,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('Acceptance | Route | Account-recovery', function() {

  describe('PATCH /api/users/{id}/account-recovery', function() {

    it('should return 204 HTTP status codes', async function() {
      // given
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = true;

      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const password = 'password123#A*';
      databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId,
        temporaryKey: 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=',
        newEmail,
        used: false,
      });
      const temporaryKey = accountRecoveryDemand.temporaryKey;
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'temporary-key': temporaryKey,
              password,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 if IS_SCO_ACCOUNT_RECOVERY_ENABLED is not enabled', async function() {
      // given
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = false;

      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const password = 'password123#A*';
      databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId,
        temporaryKey: 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=',
        newEmail,
        used: false,
      });
      const temporaryKey = accountRecoveryDemand.temporaryKey;
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'temporary-key': temporaryKey,
              password,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].detail).to.equal('Cette route est désactivée');
    });

  });

});
