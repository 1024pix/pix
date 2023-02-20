import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Route | CertificationPointOfContact', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-point-of-contacts/me', function () {
    it('should 200 HTTP status code', async function () {
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
        url: '/api/certification-point-of-contacts/me',
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
