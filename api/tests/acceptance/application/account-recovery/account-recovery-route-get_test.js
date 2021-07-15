const { expect, databaseBuilder } = require('../../../test-helper');
const { featureToggles } = require('../../../../lib/config');
const createServer = require('../../../../server');

describe('Integration | Application | Account-Recovery | Routes', () => {

  describe('GET /api/account-recovery/{temporaryKey}', () => {

    it('should return 200 http status code when account recovery demand found', async () => {
      // given
      const temporaryKey = 'DJFKDKJJSHQJ';
      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      databaseBuilder.factory.buildAccountRecoveryDemand({ userId, temporaryKey, newEmail, used: false });
      await databaseBuilder.commit();
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = true;

      const options = {
        method: 'GET',
        url: '/api/account-recovery/' + temporaryKey,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('users');
      expect(response.result.data.id).to.equal(userId.toString());
      expect(response.result.data.attributes.email).to.equal(newEmail);

    });

    it('should return 404 http status code when the feature disabled', async () => {
      // given
      const temporaryKey = 'DJFKDKJJSHQJ';
      const server = await createServer();

      const options = {
        method: 'GET',
        url: '/api/account-recovery/' + temporaryKey,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

  });
});
