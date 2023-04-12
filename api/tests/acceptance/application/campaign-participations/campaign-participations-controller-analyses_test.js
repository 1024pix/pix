const createServer = require('../../../../server');
const Membership = require('../../../../lib/domain/models/Membership');
const {
  expect,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');

describe('Acceptance | API | Campaign Participations | Analyses', function () {
  let server, options, userId, organization, campaign, campaignParticipation;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaign-participations/{id}/analyses', function () {
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°3',
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillId1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillId2' });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
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
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
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
          id: campaign.id.toString(),
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [
                {
                  id: `${campaign.id}_recTube1`,
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
            id: `${campaign.id}_recTube1`,
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
});
