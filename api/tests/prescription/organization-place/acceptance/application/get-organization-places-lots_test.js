import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Route | Get Organizations Places Lots', function () {
  describe('GET /api/organizations/{id}/places-lots', function () {
    it('should call the controller to get organization places', async function () {
      // given
      const server = await createServer();

      const { organizationId, userId } = databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
      });
      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      }).id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 13,
        activationDate: new Date('2023-01-01'),
        expirationDate: new Date('2023-12-12'),
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/places-lots`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data[0].type).to.equal('organization-places-lots');
      expect(response.statusCode).to.equal(200);
    });
  });
});
