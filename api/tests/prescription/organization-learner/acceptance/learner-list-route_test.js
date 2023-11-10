import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { Membership } from '../../../../lib/domain/models/Membership.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Application | learner-list-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/organizations/{organizationId}/participants', function () {
    it('should return the matching participants as JSON API', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
      });

      await databaseBuilder.commit();

      const expectedResult = {
        data: [{ id: organizationLearner.id.toString() }],
      };

      const request = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/participants`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when

      const response = await server.inject(request);
      expect(response.result.data.id).to.deep.equal(expectedResult.data.id);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
