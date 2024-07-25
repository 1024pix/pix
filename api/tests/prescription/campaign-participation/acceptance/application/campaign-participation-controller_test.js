import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | Campaign Participations', function () {
  let server, options, userId, organizationId, campaignId;

  beforeEach(async function () {
    server = await createServer();
    userId = databaseBuilder.factory.buildUser().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  describe('DELETE /api/campaign/{campaignId}/campaign-participations/{campaignParticipationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
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
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Die Hard',
        campaignId,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/profiles-collection-participations/${campaignParticipation.id}`,
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

  describe('GET /api/campaign-participations/{id}/analyses', function () {
    let campaignParticipation;

    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId2' });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });

      await databaseBuilder.commit();

      const learningContent = [
        {
          id: 'recArea1',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              tubes: [
                {
                  id: 'recTube1',
                  practicalTitle_i18n: { fr: 'Monter une étagère' },
                  practicalDescription_i18n: { fr: 'Comment monter une étagère' },
                  skills: [
                    {
                      id: 'recSkillId1',
                      nom: '@skill1',
                      level: 1,
                      challenges: [],
                      tutorials: [
                        {
                          id: 'recTutorial1',
                          title: 'Apprendre à vivre confiné',
                          format: '2 mois',
                          source: 'covid-19',
                          link: 'www.liberez-moi.fr',
                          locale: 'fr-fr',
                          duration: '00:03:31',
                        },
                      ],
                    },
                    {
                      id: 'recSkillId2',
                      nom: '@skill2',
                      level: 2,
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should return the campaign participation analyses', async function () {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedCampaignParticipationAnalysis = {
        data: {
          type: 'campaign-analyses',
          id: campaignId.toString(),
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [
                {
                  id: `${campaignId}_recTube1`,
                  type: 'campaignTubeRecommendations',
                },
              ],
            },
          },
        },
        included: [
          {
            id: 'recTutorial1',
            type: 'tutorials',
            attributes: {
              duration: '00:03:31',
              format: '2 mois',
              id: 'recTutorial1',
              link: 'www.liberez-moi.fr',
              source: 'covid-19',
              title: 'Apprendre à vivre confiné',
            },
          },
          {
            id: `${campaignId}_recTube1`,
            type: 'campaignTubeRecommendations',
            attributes: {
              'area-color': 'specialColor',
              'tube-id': 'recTube1',
              'competence-id': 'recCompetence1',
              'competence-name': 'Fabriquer un meuble',
              'tube-practical-title': 'Monter une étagère',
              'tube-description': 'Comment monter une étagère',
              'average-score': 30,
            },
            relationships: {
              tutorials: {
                data: [
                  {
                    id: 'recTutorial1',
                    type: 'tutorials',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCampaignParticipationAnalysis);
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}', function () {
    it('should return the assessment participation', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
        organizationLearnerId: organizationLearner.id,
      });
      databaseBuilder.factory.buildAssessment({
        userId: organizationLearner.userId,
        campaignParticipationId: campaignParticipation.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/assessment-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const assessmentParticipation = response.result.data.attributes;
      expect(assessmentParticipation['participant-external-id']).to.equal('Maitre Yoda');
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}/results', function () {
    beforeEach(function () {
      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkillId1',
                      nom: '@web2',
                      challenges: [],
                    },
                    {
                      id: 'recSkillId2',
                      nom: '@web3',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should return the assessment participation results', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
        organizationLearnerId: organizationLearner.id,
      });
      databaseBuilder.factory.buildAssessment({
        userId: organizationLearner.userId,
        campaignParticipationId: campaignParticipation.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/assessment-participations/${campaignParticipation.id}/results`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('campaign-assessment-participation-results');
    });
  });

  describe('GET /api/campaigns/{campaignId}/organization-learners/{organizationLearnerId}/participations', function () {
    beforeEach(function () {
      const learningObjects = learningContentBuilder.fromAreas([]);
      mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
      }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/organization-learners/${organizationLearnerId}/participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.result.data[0].type).to.equal('available-campaign-participations');
      expect(response.result.data[0].id).to.equal(`${campaignParticipationId}`);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/campaign-participations/{id}', function () {
    it('should update the participant external id', async function () {
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/campaign-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
        payload: {
          data: {
            id: campaignParticipation.id,
            attributes: {
              'participant-external-id': 'Dark Vador',
            },
            type: 'campaign-participations',
          },
        },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(204);
      const { participantExternalId: updatedParticipantExternalId } = await knex('campaign-participations')
        .select('participantExternalId')
        .where('id', campaignParticipation.id)
        .first();
      expect(updatedParticipantExternalId).to.equal('Dark Vador');
    });
  });

  describe('GET /api/admin/campaigns/{campaignId}/participations', function () {
    it('should return participations', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/campaigns/${campaign.id}/participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.equal(campaignParticipation.id.toString());
    });
  });
});
