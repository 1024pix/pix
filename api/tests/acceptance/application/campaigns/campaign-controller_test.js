import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | API | Campaign Controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/campaigns/{id}', function () {
    it('should return 200 when user is admin but not owner of the campaign', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId: organization.id });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'toto',
              title: null,
              'custom-landing-page-text': 'toto',
              'owner-id': userId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 403 when user is not an admin and is not the campaign owner', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        creatorId: databaseBuilder.factory.buildUser({ id: 3 }).id,
        ownerId: databaseBuilder.factory.buildUser({ id: 2 }).id,
      });
      const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'MEMBER', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'toto',
              title: null,
              'custom-landing-page-text': 'toto',
              'owner-id': userId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
