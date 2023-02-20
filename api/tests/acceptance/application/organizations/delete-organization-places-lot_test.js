import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Route | Organizations', function () {
  describe('DELETE /api/admin/organizations/{id}/places/{placeId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace();

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/${organizationPlace.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace();

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/123156`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 409 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminUser = await insertUserWithRoleSuperAdmin();
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace({
        deletedAt: new Date(),
        deletedBy: adminUser.id,
      });

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationPlace.organizationId}/places/${organizationPlace.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(409);
    });
  });
});
