import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | organization-learners-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organization-learners/{id}/activity', function () {
    describe('Success case', function () {
      it('should return the organizationLearner activity (participations) and a 200 status code response', async function () {
        //given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId,
        });

        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organization-learners/${organizationLearnerId}/activity`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learner-activities');
        expect(response.result.data.id).to.equal(organizationLearnerId.toString());
      });
    });
  });
});
