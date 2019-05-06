const _ = require('lodash');
const createServer = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const cache = require('../../../lib/infrastructure/caches/cache');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

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
    assessment = databaseBuilder.factory.buildAssessment({ userId: user.id, type: Assessment.types.SMARTPLACEMENT });
  });

  describe('GET /api/campaign-participations/{id}', () => {

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        assessmentId: assessment.id,
        campaign,
        campaignId: campaign.id,
        userId: user.id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaign-participation', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}?include=user`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
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
        assessmentId: assessment.id,
        campaignId: campaign.id,
        userId: user.id,
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when the user own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}&include=campaign,user`,
          headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        };
      });

      it('should return the campaign-participation of the given assessmentId', () => {
        // given
        const expectedCampaignParticipation = [
          {
            'attributes': {
              'created-at': campaignParticipation.createdAt,
              'is-shared': Number(campaignParticipation.isShared),
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
      const competence1 = airtableBuilder.factory.buildCompetence({ id: 1, titre: 'Liberticide', acquisViaTubes: skillIds1 });
      const competence2 = airtableBuilder.factory.buildCompetence({ id: 2, titre: 'Inéquités, inégalités', acquisViaTubes: skillIds2, });
      const competence3 = airtableBuilder.factory.buildCompetence({ id: 3, titre: 'Le capital au XXIème siècle', acquisViaTubes: skillIds3, });
      const competences = [ competence1, competence2, competence3 ];

      // Build a target profile targeting the full competence 1, partly competence 2, and nothing in competence 3
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({ id: 1 });
      _([ skillIds1, _.dropRight(skillIds2) ]).flatten().each((skillId) =>
        databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId, skillId })
      );

      // Create an organization with his owner
      user = databaseBuilder.factory.buildUser({ id: 1 });
      const userId = user.id;
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ id: 1, userId });
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      // Organization decides to start a campaign based on previous target profile
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ id: 1, name: 'Super camp', creatorId: userId, targetProfileId, organizationId });

      // Another user starts a campaign
      assessment = databaseBuilder.factory.buildAssessment({ id: 1 });
      const { id: assessmentId } = assessment;

      participant = databaseBuilder.factory.buildUser({ id: 2, firstName: 'Michel', lastName: 'Essentiel' });
      participantExternalId = '1337';
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ id: 1, assessmentId, userId: participant.id, participantExternalId, campaignId, isShared: true });

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

      ]).each((ke, id) => {
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id, userId: participant.id, assessmentId, ...ke });
      });

      airtableBuilder.mockList({ tableName: 'Acquis' }).returns(dataSourceSkills).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns(competences).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([]).activate();

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/campaign-participations?filter[campaignId]=${campaignId}&include=user,campaign-participation-result&page[number]=1&page[size]=10`,
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    });

    afterEach(async () => {
      await cache.flushAll();
      await databaseBuilder.clean();
      await airtableBuilder.cleanAll();
    });

    it('should return the campaign participation of a given campaign with each campaign participation result', () => {
      // given
      const expectedCampaignParticipation = {
        data: [
          {
            attributes: {
              'created-at': campaignParticipation.createdAt,
              'is-shared': 1,
              'participant-external-id': participantExternalId,
              'shared-at': campaignParticipation.sharedAt,
            },
            id: '1',
            relationships: {
              assessment: {
                links: {
                  related: '/api/assessments/1',
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
                  'related': '/api/campaign-participations/1/campaign-participation-result'
                },
              },
              user: {
                data: {
                  id: '2',
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
            id: '2',
            type: 'users'
          },
          {
            attributes: {
              'competence-results': [
                {
                  id: 1,
                  index: '1.1',
                  name: 'Liberticide',
                  testedSkillsCount: 4,
                  totalSkillsCount: 4,
                  validatedSkillsCount: 3,
                },
                {
                  id: 2,
                  index: '1.1',
                  name: 'Inéquités, inégalités',
                  testedSkillsCount: 3,
                  totalSkillsCount: 3,
                  validatedSkillsCount: 2,
                },
              ],
              id: 1,
              'is-completed': true,
              'tested-skills-count': 7,
              'total-skills-count': 7,
              'validated-skills-count': 5,
            },
            id: '1',
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

    beforeEach(async () => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
        assessmentId: assessment.id,
      });

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            isShared: true
          }
        },
      };
      await databaseBuilder.commit();

    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should allow user to share his campaign participation', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });
    });
  });

  describe('POST /api/campaign-participations', () => {

    const campaignId = 132435;
    const options = {
      method: 'POST',
      url: '/api/campaign-participations',
      headers: { authorization: generateValidRequestAuhorizationHeader() },
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'iuqezfh13736',
          },
          relationships: {
            'campaign': {
              data: {
                id: campaignId,
                type: 'campaigns',
              }
            }
          }
        }
      }
    };

    beforeEach(async () => {
      databaseBuilder.factory.buildCampaign({ id: campaignId });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return 404 error if the campaign related to the participation does not exist', () => {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
