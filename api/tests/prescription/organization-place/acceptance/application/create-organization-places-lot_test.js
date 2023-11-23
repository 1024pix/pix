import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import * as organizationPlacesCategories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';

describe('Acceptance | Route | Create Organization Places Lot', function () {
  describe('POST /api/admin/organizations/{id}/places', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const options = {
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/places`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              count: 10,
              'activation-date': '2022-01-02',
              'expiration-date': '2023-01-01',
              reference: 'abc123',
              category: organizationPlacesCategories.FREE_RATE,
              'created-by': adminUser.id,
            },
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
