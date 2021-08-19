const createServer = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, mockLearningContent, learningContentBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', function() {

  let server,
    options,
    user;

  beforeEach(async function() {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
  });

  describe('PATCH /api/campaign-participations/{id}', function() {

    let campaignParticipationId;

    beforeEach(async function() {
      campaignParticipationId = 123111;

      const learningContent = [{
        id: 'recArea1',
        competences: [{
          id: 'recCompetence1',
          tubes: [{
            id: 'recTube1',
            skills: [
              {
                id: 'recAcquisWeb1',
                nom: '@web1',
              },
            ],
          }],
        }],
      }];
      const learningObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningObjects);

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            isShared: true,
          },
        },
      };

    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-sibling-hooks
    beforeEach(function() {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recAcquisWeb1' });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        userId: user.id,
        isShared: false,
        sharedAt: null,
        campaignId: campaign.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      return databaseBuilder.commit();
    });

    it('shares the campaign participation', async function() {
      // when
      const response = await server.inject(options);
      const campaignParticipation = await knex('campaign-participations').first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(campaignParticipation.isShared).to.equal(true);
    });
  });

  describe('POST /api/campaign-participations', function() {

    let campaignId;
    const options = {
      method: 'POST',
      url: '/api/campaign-participations',
      headers: { authorization: generateValidRequestAuthorizationHeader() },
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'iuqezfh13736',
          },
          relationships: {
            'campaign': {
              data: {
                id: null,
                type: 'campaigns',
              },
            },
          },
        },
      },
    };

    beforeEach(async function() {
      options.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async function() {
      await knex('assessments').delete();
      return knex('campaign-participations').delete();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async function() {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return 404 error if the campaign related to the participation does not exist', async function() {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 412 error if the user has already participated to the campaign', async function() {
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

  describe('PATCH /api/campaign-participations/{id}/begin-improvement', function() {

    afterEach(function() {
      return knex('assessments').delete();
    });

    it('should return 401 HTTP status code when user is not connected', async function() {
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

    it('should return 204 HTTP status code', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, isShared: false }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
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

    it('should return 412 HTTP status code when user has already shared his results', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, isShared: true }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
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

    it('should return 403 HTTP status code when user is not the owner of the participation', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: anotherUserId, isShared: false }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
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

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function() {

    beforeEach(function() {
      const learningObjects = learningContentBuilder.buildLearningContent([]);
      mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ participantExternalId: 'Die Hard', campaignId: campaign.id });

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
});
