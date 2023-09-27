import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

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
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
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
      expect(response.result.data.attributes.lang).to.equal('fr');

      expect(response.result.data.relationships).to.to.deep.include({
        'certification-center-memberships': {
          data: [
            {
              id: certificationCenterMembershipId.toString(),
              type: 'certification-center-membership',
            },
          ],
        },
      });

      expect(response.result.included).to.deep.include({
        id: certificationCenterMembershipId.toString(),
        type: 'certification-center-membership',
        attributes: {
          'certification-center-id': certificationCenterId,
          'user-id': userId,
          role: 'MEMBER',
        },
      });
    });
  });
});
