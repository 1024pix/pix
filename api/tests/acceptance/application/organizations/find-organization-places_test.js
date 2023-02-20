import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';
import organizationPlacesLotCategories from '../../../../lib/domain/constants/organization-places-categories';

describe('Acceptance | Route | Organizations', function () {
  describe('GET /api/admin/organizations/{id}/places', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 18,
        activationDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
        reference: 'Godzilla',
        category: organizationPlacesLotCategories.FULL_RATE,
        createdBy: adminUser.id,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places`,
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
      const place = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        createdBy: adminUser.id,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.length).to.equal(1);

      expect(response.result.data[0].id).to.equal(place.id.toString());
      expect(response.result.data[0].attributes.reference).to.equal(place.reference);
    });
  });
});
