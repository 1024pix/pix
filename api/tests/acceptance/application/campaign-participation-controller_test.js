const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, mockLearningContent, learningContentBuilder, knex, HttpTestServer, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const moduleUnderTest = require('../../../lib/application/campaign-participations');

describe('Acceptance | API | Campaign Participations', () => {

  let server,
    request,
    user,
    campaign,
    assessment,
    campaignParticipation;

  const authenticationEnabled = true;

  before(async () => {
    server = new HttpTestServer(moduleUnderTest, authenticationEnabled);
  });

  beforeEach(async () => {
    user = databaseBuilder.factory.buildUser();
  });

  describe('GET /api/campaign-participations/{id}', () => {

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaign,
        campaignId: campaign.id,
        userId: user.id,
      });
      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
      });

      await databaseBuilder.commit();
    });

    it('should return the campaign-participation', async () => {
      // given
      request = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}?include=user`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
      const expectedCampaignParticipation = {
        id: campaignParticipation.id.toString(),
        type: 'campaign-participations',
        'attributes': {
          'created-at': campaignParticipation.createdAt,
          'is-shared': campaignParticipation.isShared,
          'participant-external-id': campaignParticipation.participantExternalId,
          'shared-at': campaignParticipation.sharedAt,
        },
        relationships: {
          campaign: {
            data: null,
          },
          user: {
            data: {
              id: `${user.id}`,
              type: 'users',
            },
          },
          assessment: {
            links: {
              related: `/api/assessments/${assessment.id}`,
            },
          },
          'campaign-participation-result': {
            links: {
              related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`,
            },
          },
          'campaign-analysis': {
            links: {
              related: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
            },
          },
        },
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedCampaignParticipation);
    });
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: true,
        campaignId: campaign.id,
        userId: user.id,
      });
      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
      });

      await databaseBuilder.commit();
    });

    context('when the user own the campaign participation', () => {

      beforeEach(() => {
        request = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}&include=campaign,user`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };
      });

      it('should return the campaign-participation of the given assessmentId', async () => {
        // given
        const expectedCampaignParticipation = [
          {
            'attributes': {
              'created-at': campaignParticipation.createdAt,
              'is-shared': campaignParticipation.isShared,
              'participant-external-id': campaignParticipation.participantExternalId,
              'shared-at': campaignParticipation.sharedAt,
            },
            'id': campaignParticipation.id.toString(),
            'type': 'campaign-participations',
            relationships: {
              campaign: {
                data: {
                  type: 'campaigns',
                  id: campaign.id.toString(),
                },
              },
              user: {
                data: {
                  'id': user.id.toString(),
                  'type': 'users',
                },
              },
              assessment: {
                links: {
                  related: `/api/assessments/${assessment.id}`,
                },
              },
              'campaign-participation-result': {
                links: {
                  related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`,
                },
              },
              'campaign-analysis': {
                links: {
                  related: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
                },
              },
            },
          },
        ];

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.deep.equal(expectedCampaignParticipation);

      });

    });

    context('when the user doesnt own the campaign participation', () => {

      beforeEach(() => {
        request = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
          headers: { authorization: 'USER_UNATHORIZED' },
        };
      });

      it('it should reply an unauthorized error', async () => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when the assessmentId is not an integer', () => {

      it('returns 404 when assessmentId is not an integer', async () => {
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });
        databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

        await databaseBuilder.commit();

        const request = {
          method: 'GET',
          url: '/api/campaign-participations?filter[assessmentId]=abcd',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        const response = await server.requestObject(request);

        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    let campaignParticipationId;

    beforeEach(async () => {
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

      request = {
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

    beforeEach(() => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recAcquisWeb1' });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        userId: user.id,
        isShared: false,
        sharedAt: null,
        campaignId: campaign.id,
      });
      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      return databaseBuilder.commit();
    });

    it('shares the campaign participation', async () => {
      // when
      const response = await server.requestObject(request);
      const campaignParticipation = await knex('campaign-participations').first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(campaignParticipation.isShared).to.equal(true);
    });
  });

  describe('POST /api/campaign-participations', () => {

    let campaignId;
    const request = {
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

    beforeEach(async () => {
      request.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('assessments').delete();
      return knex('campaign-participations').delete();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async () => {
      // given
      request.payload.data.relationships.campaign.data.id = campaignId;

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return 404 error if the campaign related to the participation does not exist', async () => {
      // given
      request.payload.data.relationships.campaign.data.id = null;

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 412 error if the user has already participated to the campaign', async () => {
      // given
      request.payload.data.relationships.campaign.data.id = campaignId;
      databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, campaignId });
      await databaseBuilder.commit();

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(412);
    });
  });

  describe('PATCH /api/campaign-participations/{id}/begin-improvement', () => {

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return 401 HTTP status code when user is not connected', async () => {
      // given
      request = {
        method: 'PATCH',
        url: '/api/campaign-participations/123/begin-improvement',
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should return 204 HTTP status code', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, isShared: false }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
      await databaseBuilder.commit();
      request = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 412 HTTP status code when user has already shared his results', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, isShared: true }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
      await databaseBuilder.commit();
      request = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(412);
    });

    it('should return 403 HTTP status code when user is not the owner of the participation', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: anotherUserId, isShared: false }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, isImproving: false, state: Assessment.states.COMPLETED, type: 'CAMPAIGN' });
      await databaseBuilder.commit();
      request = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}/begin-improvement`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function() {

    beforeEach(() => {
      const learningObjects = learningContentBuilder.buildLearningContent([]);
      mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async () => {

      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ participantExternalId: 'Die Hard', campaignId: campaign.id });

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/profiles-collection-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(200);
      const campaignProfile = response.result.data.attributes;
      expect(campaignProfile['external-id']).to.equal('Die Hard');
    });
  });
});
