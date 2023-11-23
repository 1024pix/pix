import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import * as categories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';

describe('Acceptance | Route | Get Organizations Places Capacity', function () {
  describe('GET /api/admin/organizations/{id}/places/capacity', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places/capacity`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return list of places', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 10,
        category: categories.T0,
        createdBy: adminUser.id,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places/capacity`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes.categories[0].count).to.equal(10);
    });
  });
});
