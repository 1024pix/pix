import * as organizationPlacesLotCategories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Route | Find Organization Places', function () {
  describe('GET /api/admin/organizations/{id}/places', function () {
    it('should return 200 HTTP status code', async function () {
      // given

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 18,
        activationDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
        reference: 'Godzilla',
        category: organizationPlacesLotCategories.FULL_RATE,
        createdBy: superAdmin.id,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return list of places', async function () {
      // given

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const place = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        createdBy: superAdmin.id,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.have.lengthOf(1);

      expect(response.result.data[0].id).to.equal(place.id.toString());
      expect(response.result.data[0].attributes.reference).to.equal(place.reference);
    });
  });
});
