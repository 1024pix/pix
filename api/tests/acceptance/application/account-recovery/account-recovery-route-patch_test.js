const { databaseBuilder, expect } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | Account-recovery', function () {
  describe('PATCH /api/users/{id}/account-recovery', function () {
    it('should return 204 HTTP status codes', async function () {
      // given
      const server = await createServer();

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
  });
});
