import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | sup-organization-learners', function () {
  describe('PATCH /api/organizations/id/sup-organization-learners/organizationLearnerId', function () {
    let organizationId;
    const studentNumber = '54321';
    let organizationLearnerId;
    let headers;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SUP' }).id;

      const user = databaseBuilder.factory.buildUser();
      headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 204', async function () {
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`,
          headers,
          payload: {
            data: {
              attributes: {
                'student-number': studentNumber,
              },
            },
          },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
