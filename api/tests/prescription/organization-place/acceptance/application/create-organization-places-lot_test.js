import { createServer } from '../../../../../server.js';
import * as organizationPlacesCategories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Route | Create Organization Places Lot', function () {
  describe('POST /api/admin/organizations/{id}/places', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const placeManagementFeature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: placeManagementFeature.id,
        params: {
          enableMaximumPlacesLimit: false,
        },
      });

      const options = {
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/places`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              count: 10,
              'activation-date': '2022-01-02',
              'expiration-date': '2023-01-01',
              reference: 'abc123',
              category: organizationPlacesCategories.FREE_RATE,
            },
            type: 'organization-place-lot',
          },
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
