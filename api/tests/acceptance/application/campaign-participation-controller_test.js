const createServer = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  let server,
    options,
    user,
    campaign,
    assessment,
    campaignParticipation;

  beforeEach(async () => {
    server = await createServer();
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
      options = {
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
      const response = await server.inject(options);

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
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}&include=campaign,user`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };
      });

      it('should return the campaign-participation of the given assessmentId', () => {
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
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.be.deep.equal(expectedCampaignParticipation);
        });
      });

    });

    context('when the user doesnt own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
          headers: { authorization: 'USER_UNATHORIZED' },
        };
      });

      it('it should reply an unauthorized error', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((error) => {
          expect(error.statusCode).to.equal(401);
        });
      });
    });

    context('when the assessmentId is not an integer', () => {

      it('returns 404 when assessmentId is not an integer', async () => {
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });
        databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: '/api/campaign-participations?filter[assessmentId]=abcd',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    let skillWeb1Id;
    let skillWeb2Id;
    let skillWeb3Id;
    let campaignParticipationId;

    beforeEach(async () => {
      const competenceId = 'recCompetence';
      campaignParticipationId = 123111;

      skillWeb1Id = 'recAcquisWeb1';
      const skillWeb1Name = '@web1';
      const skillWeb1 = airtableBuilder.factory.buildSkill({ id: skillWeb1Id, nom: skillWeb1Name, compétenceViaTube: [ competenceId ] });

      skillWeb2Id = 'recAcquisWeb2';
      const skillWeb2Name = '@web2';
      const skillWeb2 = airtableBuilder.factory.buildSkill({ id: skillWeb2Id, nom: skillWeb2Name, compétenceViaTube: [ competenceId ] });

      skillWeb3Id = 'recAcquisWeb3';
      const skillWeb3Name = '@web3';
      const skillWeb3 = airtableBuilder.factory.buildSkill({ id: skillWeb3Id, nom: skillWeb3Name, compétenceViaTube: [ competenceId ] });

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

      airtableBuilder.mockList({ tableName: 'Acquis' })
        .returns([skillWeb1, skillWeb2, skillWeb3])
        .activate();

      const challengeId = 'recchallenge';
      const challenge = airtableBuilder.factory.buildChallenge.untimed({
        id: challengeId,
        tests: [],
        competences: [competenceId],
        statut: 'validé',
        acquix: [skillWeb2Id],
        acquis: [skillWeb2Name],
      });

      const challengeWeb1 = airtableBuilder.factory.buildChallenge.untimed({
        id: challengeId,
        tests: [],
        competences: [competenceId],
        statut: 'validé',
        acquix: [skillWeb1Id],
        acquis: [skillWeb1Name],
      });
      const challengeWeb3 = airtableBuilder.factory.buildChallenge.untimed({
        id: challengeId,
        tests: [],
        competences: [competenceId],
        statut: 'validé',
        acquix: [skillWeb3Id],
        acquis: [skillWeb3Name],
      });

      airtableBuilder.mockList({ tableName: 'Epreuves' })
        .returns([challenge, challengeWeb1, challengeWeb3])
        .activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
    });

    after(() => {
      return cache.flushAll();
    });

    context('when assessment is completed', () => {
      beforeEach(() => {
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          id: campaignParticipationId,
          userId: user.id,
          isShared: false,
          sharedAt: null,
        });
        assessment = databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: user.id,
          type: Assessment.types.CAMPAIGN,
          state: Assessment.states.COMPLETED,
        });

        return databaseBuilder.commit();
      });

      it('should allow the user to share his campaign participation', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });
    });

    context('when assessment is not completed', () => {
      beforeEach(() => {
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          id: campaignParticipationId,
          userId: user.id,
          isShared: false,
          sharedAt: null,
        });
        assessment = databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: user.id,
          type: Assessment.types.CAMPAIGN,
          state: Assessment.states.STARTED,
        });

        return databaseBuilder.commit();
      });

      it('should disallow the user to share his campaign participation', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].detail).to.equal('Cette évaluation n\'est pas terminée.');
      });
    });
  });

  describe('POST /api/campaign-participations', () => {

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

    beforeEach(async () => {
      options.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('assessments').delete();
      return knex('campaign-participations').delete();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async () => {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return 404 error if the campaign related to the participation does not exist', async () => {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 412 error if the user has already participated to the campaign', async () => {
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

  describe('PATCH /api/campaign-participations/{id}/begin-improvement', () => {
    let user, campaignParticipation;
    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, isShared: false });
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    context('when user is connected', () => {
      beforeEach(() => {
        options = {
          method: 'PATCH',
          url: `/api/campaign-participations/${campaignParticipation.id}/begin-improvement`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };
      });

      it('should return 204 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('when user is not connected', () => {
      beforeEach(() => {
        options = {
          method: 'PATCH',
          url: `/api/campaign-participations/${campaignParticipation.id}/begin-improvement`,
        };
      });

      it('should return 401 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('when user is connected but does not owned the assessment', () => {
      beforeEach(async () => {
        const otherUser = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options = {
          method: 'PATCH',
          url: `/api/campaign-participations/${campaignParticipation.id}/begin-improvement`,
          headers: { authorization: generateValidRequestAuthorizationHeader(otherUser.id) },
        };
      });

      it('should return 403 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is connected but has already shared his results so he/she cannot improve it', () => {
      beforeEach(async () => {
        const sharedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, isShared: true });
        await databaseBuilder.commit();
        options = {
          method: 'PATCH',
          url: `/api/campaign-participations/${sharedCampaignParticipation.id}/begin-improvement`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };
      });

      it('should return 412 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function() {

    beforeEach(() => {
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([]).activate();
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([]).activate();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      cache.flushAll();
    });

    it('should return the campaign profile as JSONAPI', async () => {
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
