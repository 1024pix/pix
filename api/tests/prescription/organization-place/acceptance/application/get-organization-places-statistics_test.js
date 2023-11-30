import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import * as categories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { Membership } from '../../../../../lib/domain/models/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../lib/domain/constants.js';

describe('Acceptance | Route | Get Organizations Places Statistics', function () {
  describe('GET /api/organizations/{id}/places-statistics', function () {
    it('should return statistics of organization places and http code 200', async function () {
      // given
      const server = await createServer();

      const { userId, organizationId } = databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
      });
      const placesManagementFeatureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      }).id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: placesManagementFeatureId,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 10,
        activationDate: new Date('2023-01-01'),
        expirationDate: new Date('2023-12-12'),
        category: categories.T0,
        createdBy: userId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/place-statistics`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('organization-place-statistics');
    });
  });
});
