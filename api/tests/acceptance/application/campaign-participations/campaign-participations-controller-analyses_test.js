const createServer = require('../../../../server');
const Membership = require('../../../../lib/domain/models/Membership');
const { expect, databaseBuilder, mockLearningContent, learningContentBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

describe('Acceptance | API | Campaign Participations | Analyses', () => {

  let server, options, userId, organization, targetProfile, campaign, campaignParticipation;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/campaign-participations/{id}/analyses', () => {

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      targetProfile = databaseBuilder.factory.buildTargetProfile({
        organizationId: organization.id,
        name: 'Profile 3',
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkillId1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkillId2' });
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°3',
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        isShared: true,
      });

      await databaseBuilder.commit();

      const learningContent = [{
        id: 'recArea1',
        color: 'specialColor',
        competences: [{
          id: 'recCompetence1',
          name: 'Fabriquer un meuble',
          tubes: [{
            id: 'recTube1',
            practicalTitleFr: 'Monter une étagère',
            skills: [{
              id: 'recSkillId1',
              nom: '@skill1',
              challenges: [],
              tutorials: [{
                id: 'recTutorial1',
                title: 'Apprendre à vivre confiné',
                format: '2 mois',
                source: 'covid-19',
                link: 'www.liberez-moi.fr',
                locale: 'fr-fr',
                duration: '00:03:31',
              }],
            }, {
              id: 'recSkillId2',
              nom: '@skill2',
              challenges: [],
            }],
          }],
        }],
      }];
      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should return the campaign participation analyses', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedCampaignParticipationAnalysis = {
        data: {
          type: 'campaign-analyses',
          id: campaign.id.toString(),
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [{
                id: `${campaign.id}_recTube1`,
                type: 'campaignTubeRecommendations',
              }],
            },
          },
        },
        included: [{
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
        }, {
          id: `${campaign.id}_recTube1`,
          type: 'campaignTubeRecommendations',
          attributes: {
            'area-color': 'specialColor',
            'tube-id': 'recTube1',
            'competence-id': 'recCompetence1',
            'competence-name': 'Fabriquer un meuble',
            'tube-practical-title': 'Monter une étagère',
            'average-score': 30,
          },
          relationships: {
            tutorials: {
              data: [{
                id: 'recTutorial1',
                type: 'tutorials',
              }],
            },
          },
        }],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCampaignParticipationAnalysis);
    });
  });
});
