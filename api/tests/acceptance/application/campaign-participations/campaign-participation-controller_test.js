const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const {
  expect,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
  generateValidRequestAuthorizationHeader,
  knex,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');

const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Acceptance | API | Campaign Participations', function () {
  let server, options, user;

  afterEach(async function () {
    await knex('pgboss.job').delete();
    await knex('knowledge-element-snapshots').delete();
  });

  beforeEach(async function () {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
  });

  describe('PATCH /api/campaign-participations/{id}', function () {
    let campaignParticipationId;

    beforeEach(async function () {
      campaignParticipationId = 123111;

      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recAcquisWeb1',
                      nom: '@web1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningObjects);

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    it('shares the campaign participation', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recAcquisWeb1' });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        userId: user.id,
        status: STARTED,
        sharedAt: null,
        campaignId: campaign.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      const result = await knex('campaign-participations').first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(result.status).to.equal(SHARED);
    });
  });

  describe('POST /api/campaign-participations', function () {
    let campaignId;
    const options = {
      method: 'POST',
      url: '/api/campaign-participations',
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'iuqezfh13736',
          },
          relationships: {
            campaign: {
              data: {
                id: null,
                type: 'campaigns',
              },
            },
          },
        },
      },
    };

    beforeEach(async function () {
      options.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      mockLearningContent({ skills: [] });
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('assessments').delete();
      await knex('campaign-participations').delete();
      await knex('organization-learners').delete();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return a 412 if the user already participated to the campaign', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      await server.inject(options);
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(412);
      expect(response.result.errors[0].detail).to.equal(
        `User ${user.id} has already a campaign participation with campaign ${campaignId}`
      );
    });

    it('should return 404 error if the campaign related to the participation does not exist', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 412 error if the user has already participated to the campaign', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;
      databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, campaignId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(412);
    });
  });

  describe('PATCH /api/campaign-participations/{id}/begin-improvement', function () {
    afterEach(function () {
      return knex('assessments').delete();
    });

    it('should return 401 HTTP status code when user is not connected', async function () {
      // given
      options = {
        method: 'PATCH',
        url: '/api/campaign-participations/123/begin-improvement',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should return 204 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        status: STARTED,
      }).id;
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        isImproving: false,
        state: Assessment.states.COMPLETED,
        type: 'CAMPAIGN',
      });
      await databaseBuilder.commit();
      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 412 HTTP status code when user has already shared his results', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId }).id;
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        isImproving: false,
        state: Assessment.states.COMPLETED,
        type: 'CAMPAIGN',
      });
      await databaseBuilder.commit();
      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(412);
    });

    it('should return 403 HTTP status code when user is not the owner of the participation', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        userId: anotherUserId,
        status: STARTED,
      }).id;
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        isImproving: false,
        state: Assessment.states.COMPLETED,
        type: 'CAMPAIGN',
      });
      await databaseBuilder.commit();
      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
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
      const learningObjects = learningContentBuilder.buildLearningContent.fromAreas([]);
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
        duration: { hours: 6 },
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
