import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Route | Delete Organizations Places Lot', function () {
  describe('DELETE /api/admin/organizations/{id}/places/{placeId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace();

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/${organizationPlace.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 HTTP status code', async function () {
      // given

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace();

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/123156`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 409 HTTP status code', async function () {
      // given

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace({
        deletedAt: new Date(),
        deletedBy: superAdmin.id,
      });

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/${organizationPlace.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(409);
    });
  });
});
