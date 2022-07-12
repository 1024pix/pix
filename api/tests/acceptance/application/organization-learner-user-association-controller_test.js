const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Controller | organization-learner-user-associations', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/organizations/organizationId/schooling-registration-user-associations/schoolingRegistrationId', function () {
    let organizationId;
    const studentNumber = '54321';
    let organizationLearnerId;
    let authorizationToken;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SUP' }).id;

      const user = databaseBuilder.factory.buildUser();
      authorizationToken = generateValidRequestAuthorizationHeader(user.id);
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
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/${organizationLearnerId}`,
          headers: {
            authorization: authorizationToken,
          },
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
