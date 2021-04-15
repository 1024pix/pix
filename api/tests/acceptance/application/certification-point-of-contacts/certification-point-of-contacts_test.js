const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');

describe('Acceptance | Route | CertificationPointOfContact', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/certification-point-of-contacts/:userId', () => {

    it('should 200 HTTP status code', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/certification-point-of-contacts/${userId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(userId.toString());
    });
  });

});
