import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

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

  describe('GET /api/organizations/{organizationId}/divisions', function () {
    it('should return the divisions', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });

      [
        { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
        { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
        { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
        { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
      ].map((student) =>
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, ...student }),
      );

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/organizations/' + organization.id + '/divisions',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
