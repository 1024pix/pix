import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | Modules Metadata | Route', function () {
  describe('GET /api/admin/modules-metadata', function () {
    context('when modules exists', function () {
      it('should return modules metadata', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/admin/modules-metadata`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
