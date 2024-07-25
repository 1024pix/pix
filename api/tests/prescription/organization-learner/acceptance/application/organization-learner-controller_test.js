import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | organization-learner', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organization-learners/{id}', function () {
    let options;
    let organizationId;
    let organizationLearnerId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      await databaseBuilder.commit();
    });

    it('should respond with a 403 if user is not member of the organization', async function () {
      // given
      options = {
        method: 'GET',
        url: `/api/organization-learners/${organizationLearnerId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    describe('Success case', function () {
      it('should return the organization learner and a 200 status code response', async function () {
        //given
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organization-learners/${organizationLearnerId}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learners');
      });
    });
  });
});
