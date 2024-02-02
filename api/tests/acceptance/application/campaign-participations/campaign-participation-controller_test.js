import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

describe('Acceptance | API | Campaign Participations', function () {
  let server, options, user;

  beforeEach(async function () {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
  });

  describe('DELETE /api/campaign/{campaignId}/campaign-participations/{campaignParticipationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, user }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId });

      await databaseBuilder.commit();
      options = {
        method: 'DELETE',
        url: `/api/campaigns/${campaignId}/campaign-participations/${campaignParticipationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function () {
    beforeEach(function () {
      const learningObjects = learningContentBuilder.fromAreas([]);
      mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Die Hard',
        campaignId: campaign.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/profiles-collection-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const campaignProfile = response.result.data.attributes;
      expect(campaignProfile['external-id']).to.equal('Die Hard');
    });
  });

  describe('DELETE /api/admin/campaign-participations/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/campaign-participations/${campaignParticipationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/campaign-participations/{id}/trainings', function () {
    it('should return the campaign-participation trainings', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId: campaignParticipation.userId,
        trainingId: training.id,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/trainings`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal('trainings');
      expect(response.result.data[0].attributes).to.deep.equal({
        duration: { days: 0, hours: 6, minutes: 0 },
        link: training.link,
        locale: training.locale,
        title: training.title,
        type: training.type,
        'editor-name': training.editorName,
        'editor-logo-url': training.editorLogoUrl,
      });
    });
  });
});
