import { LABEL_FOR_CORE } from '../../../../../src/certification/enrolment/domain/models/UserCertificabilityCalculator.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Certification | Enrolment | Acceptance | Users', function () {
  describe('GET /api/users/:id/is-certifiable', function () {
    let server;
    let options;
    let user;

    beforeEach(async function () {
      server = await createServer();
      user = databaseBuilder.factory.buildUser();
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        key: 'SomeComplementaryKey',
      }).id;
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        label: 'monLabel',
        imageUrl: 'monImageUrl',
        complementaryCertificationId,
        detachedAt: null,
      }).id;
      databaseBuilder.factory.buildUserCertificability({
        userId: user.id,
        certificability: JSON.stringify([]),
        certificabilityV2: JSON.stringify([
          { certification: LABEL_FOR_CORE, isCertifiable: true },
          {
            certification: 'SomeComplementaryKey',
            isCertifiable: true,
            complementaryCertificationBadgeId,
            complementaryCertificationId,
            campaignId: 'not important here',
            badgeKey: 'not important here',
            why: { isOutdated: false, isCoreCertifiable: true },
            info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
          },
        ]),
        latestKnowledgeElementCreatedAt: null,
        latestCertificationDeliveredAt: null,
        latestBadgeAcquisitionUpdatedAt: null,
        latestComplementaryCertificationBadgeDetachedAt: null,
      });

      options = {
        method: 'GET',
        url: `/api/users/${user.id}/is-certifiable`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      return databaseBuilder.commit();
    });

    it('should return a 200 status code response with JSON API serialized isCertifiable', async function () {
      // given
      const expectedResponse = {
        data: {
          id: `${user.id}`,
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
            'complementary-certifications': [
              {
                imageUrl: 'monImageUrl',
                label: 'monLabel',
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
            ],
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResponse);
    });
  });
});
