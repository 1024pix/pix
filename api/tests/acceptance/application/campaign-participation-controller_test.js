const _ = require('lodash');
const faker = require('faker');
const createServer = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  const JAFFA_COLOR = 'jaffa';

  let server,
    options,
    user,
    participant,
    campaign,
    assessment,
    participantExternalId,
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
        userId: user.id
      });
      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.SMARTPLACEMENT,
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
            data: null
          },
          user: {
            data: {
              id: `${user.id}`,
              type: 'users',
            }
          },
          assessment: {
            links: {
              related: `/api/assessments/${assessment.id}`
            }
          },
          'campaign-participation-result': {
            links: {
              related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
            }
          },
        }
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
        type: Assessment.types.SMARTPLACEMENT,
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
                  id: campaign.id.toString()
                }
              },
              user: {
                data: {
                  'id': user.id.toString(),
                  'type': 'users'
                }
              },
              assessment: {
                links: {
                  related: `/api/assessments/${assessment.id}`
                }
              },
              'campaign-participation-result': {
                links: {
                  related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
                }
              }
            }
          }
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
  });

  describe('GET /api/campaign-participations?filter[campaignId]={id}&include=user,campaign-participation-result&page[number]=1&page[size]=10', () => {

    beforeEach(async () => {

      // First, setup the referential
      const dataSourceSkills = _.times(10, (i) => airtableBuilder.factory.buildSkill({ id: `recTIddrkopID28Ep_${i}` }));
      const skillIds = _.map(dataSourceSkills, 'id');
      const [ skillIds1, skillIds2, skillIds3 ] = _.chunk(skillIds, 4);

      const jaffaArea = airtableBuilder.factory.buildArea({
        id: 1,
        competenceIds: ['1', '2', '3'],
        couleur: JAFFA_COLOR
      });
      const areas = [jaffaArea];

      const competence1 = airtableBuilder.factory.buildCompetence({
        id: 1,
        titre: 'Liberticide',
        acquisViaTubes: skillIds1,
        domaineIds: [jaffaArea.id],
      });
      const competence2 = airtableBuilder.factory.buildCompetence({
        id: 2,
        titre: 'Inéquités, inégalités',
        acquisViaTubes: skillIds2,
        domaineIds: [jaffaArea.id],
      });
      const competence3 = airtableBuilder.factory.buildCompetence({
        id: 3,
        titre: 'Le capital au XXIème siècle',
        acquisViaTubes: skillIds3,
        domaineIds: [jaffaArea.id],
      });
      const competences = [ competence1, competence2, competence3 ];

      // Build a target profile targeting the full competence 1, partly competence 2, and nothing in competence 3
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      _([ skillIds1, _.dropRight(skillIds2) ]).flatten().each((skillId) =>
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
      );

      // Create an organization with his owner
      user = databaseBuilder.factory.buildUser();
      const userId = user.id;
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ userId });
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      // Organization decides to start a campaign based on previous target profile
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ name: 'Super camp', creatorId: userId, targetProfileId, organizationId });

      // Another user starts a campaign
      assessment = databaseBuilder.factory.buildAssessment();
      const { id: assessmentId } = assessment;

      participant = databaseBuilder.factory.buildUser({ firstName: 'Michel', lastName: 'Essentiel' });
      participantExternalId = '1337';
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId: participant.id, participantExternalId, campaignId, isShared: true });
      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.SMARTPLACEMENT,
      });

      // And starts answering questions
      _([
        { skillId: skillIds1[0], status: 'validated' },
        { skillId: skillIds1[0], status: 'validated' },
        { skillId: skillIds1[1], status: 'validated' },
        { skillId: skillIds1[2], status: 'validated' },
        { skillId: skillIds1[3], status: 'invalidated' },
        { skillId: skillIds2[0], status: 'validated' },
        { skillId: skillIds2[1], status: 'validated' },
        { skillId: skillIds2[2], status: 'invalidated' },

      ]).each((ke) => {
        databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId: participant.id, assessmentId, createdAt: faker.date.past(10, campaignParticipation.sharedAt) });
        databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId: participant.id, assessmentId, createdAt: faker.date.future(10, campaignParticipation.sharedAt) });
      });

      airtableBuilder.mockList({ tableName: 'Acquis' }).returns(dataSourceSkills).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns(competences).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns(areas).activate();

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/campaign-participations?filter[campaignId]=${campaignId}&include=user,campaign-participation-result&page[number]=1&page[size]=10`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return the campaign participation of a given campaign with each campaign participation result', () => {
      // given
      const expectedCampaignParticipation = {
        data: [
          {
            attributes: {
              'created-at': campaignParticipation.createdAt,
              'is-shared': true,
              'participant-external-id': participantExternalId,
              'shared-at': campaignParticipation.sharedAt,
            },
            id: campaignParticipation.id.toString(),
            relationships: {
              assessment: {
                links: {
                  related: '/api/assessments/' + assessment.id.toString(),
                }
              },
              campaign: {
                data: null
              },
              'campaign-participation-result': {
                data: {
                  id: campaignParticipation.id.toString(),
                  type: 'campaignParticipationResults',
                },
                links: {
                  'related': '/api/campaign-participations/' + campaignParticipation.id.toString() + '/campaign-participation-result'
                },
              },
              user: {
                data: {
                  id: participant.id.toString(),
                  type: 'users',
                }
              }
            },
            type: 'campaign-participations'
          }
        ],
        included: [
          {
            attributes: {
              'first-name': 'Michel',
              'last-name': 'Essentiel',
            },
            id: participant.id.toString(),
            type: 'users'
          },
          {
            attributes: {
              'area-color': 'jaffa',
              index: '1.1',
              'mastery-percentage': 75,
              name: 'Liberticide',
              'tested-skills-count': 4,
              'total-skills-count': 4,
              'validated-skills-count': 3,
            },
            id: '1',
            type: 'competenceResults',
          },
          {
            attributes: {
              'area-color': 'jaffa',
              index: '1.1',
              'mastery-percentage': 67,
              name: 'Inéquités, inégalités',
              'tested-skills-count': 3,
              'total-skills-count': 3,
              'validated-skills-count': 2,
            },
            id: '2',
            type: 'competenceResults',
          },
          {
            attributes: {
              id: campaignParticipation.id,
              'is-completed': true,
              'mastery-percentage': 71,
              'tested-skills-count': 7,
              'total-skills-count': 7,
              'validated-skills-count': 5,
              'progress': 1,
            },
            relationships: {
              'competence-results': {
                data: [
                  {
                    id: '1',
                    type: 'competenceResults',
                  },
                  {
                    id: '2',
                    type: 'competenceResults',
                  }
                ]
              }
            },
            id: campaignParticipation.id.toString(),
            type: 'campaignParticipationResults',
          }
        ],
        meta: {
          'page': 1,
          'pageCount': 1,
          'pageSize': 10,
          'rowCount': 1,
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.deep.equal(expectedCampaignParticipation);
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
      const skillWeb1 = airtableBuilder.factory.buildSkill({ id: skillWeb1Id, nom: skillWeb1Name, compétenceViaTube: [ competenceId ], });

      skillWeb2Id = 'recAcquisWeb2';
      const skillWeb2Name = '@web2';
      const skillWeb2 = airtableBuilder.factory.buildSkill({ id: skillWeb2Id, nom: skillWeb2Name, compétenceViaTube: [ competenceId ], });

      skillWeb3Id = 'recAcquisWeb3';
      const skillWeb3Name = '@web3';
      const skillWeb3 = airtableBuilder.factory.buildSkill({ id: skillWeb3Id, nom: skillWeb3Name, compétenceViaTube: [ competenceId ], });

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            isShared: true
          }
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

    context('when there is no remaining challenges', () => {
      beforeEach(async () => {
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb1Id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb2Id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb3Id });

        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          id: campaignParticipationId,
          isShared: false,
          sharedAt: null,
          campaignId: campaign.id,
        });
        assessment = databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: user.id,
          type: Assessment.types.SMARTPLACEMENT,
        });

        _([
          { skillId: skillWeb1Id, status: 'validated' },
          { skillId: skillWeb2Id, status: 'validated' },
          { skillId: skillWeb3Id, status: 'validated' },
        ]).each((ke, id) => {
          databaseBuilder.factory.buildKnowledgeElement({ ...ke, id, userId: user.id, assessmentId: assessment.id, });
        });

        await databaseBuilder.commit();
      });

      it('should allow the user to share his campaign participation', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });
    });

    context('when there is some remaining challenges', () => {
      beforeEach(async () => {
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb1Id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb2Id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillWeb3Id });

        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          id: campaignParticipationId,
          isShared: false,
          sharedAt: null,
          campaignId: campaign.id,
        });
        assessment = databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: user.id,
          type: Assessment.types.SMARTPLACEMENT,
        });

        await databaseBuilder.commit();
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
              }
            }
          }
        }
      }
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

    it('should return 421 error if the user has already participated to the campaign', async () => {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;
      databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, campaignId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(421);
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

      it('should return 200 HTTP status code with updatedAssessment', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
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

      it('should return 421 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(421);
      });
    });
  });

});
