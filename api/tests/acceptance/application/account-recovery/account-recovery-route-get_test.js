const { expect, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Application | Account-Recovery | Routes', function () {
  describe('GET /api/account-recovery/{temporaryKey}', function () {
    it('should return 200 http status code when account recovery demand found', async function () {
      // given
      const temporaryKey = 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=';
      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const firstName = 'Gertrude';
      databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const { id: schoolingRegistrationId } = databaseBuilder.factory.buildOrganizationLearner({ userId, firstName });
      const { id } = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId,
        schoolingRegistrationId,
        temporaryKey,
        newEmail,
        used: false,
      });
      await databaseBuilder.commit();
      const server = await createServer();

      const options = {
        method: 'GET',
        url: '/api/account-recovery/' + temporaryKey,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.email).to.equal(newEmail.toLowerCase());
      expect(response.result.data.attributes['first-name']).to.equal(firstName);
      expect(response.result.data.id).to.equal(id.toString());
    });
  });
});
