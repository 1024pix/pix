import { createServer } from '../../../../../server.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | OrganizationLearnerTypes', function () {
  describe('GET /api/admin/organization-learner-types', function () {
    it('returns a list of organization learner types with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const organizationLearnerType1 = databaseBuilder.factory.buildOrganizationLearnerType({
        id: 123,
        name: 'Public 1',
      });
      const organizationLearnerType2 = databaseBuilder.factory.buildOrganizationLearnerType({
        id: 456,
        name: 'Public 2',
      });
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/organization-learner-types',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          attributes: {
            name: organizationLearnerType1.name,
          },
          id: '123',
          type: 'organization-learner-types',
        },
        {
          attributes: {
            name: organizationLearnerType2.name,
          },
          id: '456',
          type: 'organization-learner-types',
        },
      ]);
    });
  });
});
