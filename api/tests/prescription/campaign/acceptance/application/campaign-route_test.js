import { Membership } from '../../../../../lib/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | Campaign Route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns/{campaignId}/divisions', function () {
    it('should return the campaign participants division', async function () {
      const division = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withMembership({ organizationId: campaign.organizationId });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, division: division },
        { campaignId: campaign.id },
      );
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/divisions`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].attributes.name).to.equal(division);
    });
  });

  describe('GET /api/campaigns/{campaignId}/groups', function () {
    it('should return the campaign participants group', async function () {
      const group = 'LB3';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withMembership({ organizationId: campaign.organizationId });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, group: group },
        { campaignId: campaign.id },
      );
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/groups`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].attributes.name).to.equal(group);
    });
  });

  describe('GET /api/campaigns/{id}/analyses', function () {
    let userId, organization, campaign;

    describe('skill Ids provide by the campaign', function () {
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
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            color: 'specialColor',
            competences: [
              {
                id: 'recCompetence1',
                name_i18n: { fr: 'Fabriquer un meuble' },
                index: '1.1',
                tubes: [
                  {
                    id: 'recTube1',
                    practicalTitle_i18n: { fr: 'Monter une étagère FR' },
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
                            duration: '00:03:31',
                            locale: 'fr-fr',
                          },
                        ],
                      },
                      {
                        id: 'recSkillId2',
                        nom: '@skill2',
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

      it('should return campaign analysis with status code 200', async function () {
        // given
        const url = `/api/campaigns/${campaign.id}/analyses`;
        const request = {
          method: 'GET',
          url,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        const expectedResult = {
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
                'tube-practical-title': 'Monter une étagère FR',
                'average-score': 30,
                'tube-description': 'Comment monter une étagère',
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
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });

    describe('skill Ids provide by the target profile (old logic)', function () {
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
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            color: 'specialColor',
            competences: [
              {
                id: 'recCompetence1',
                name_i18n: { fr: 'Fabriquer un meuble' },
                index: '1.1',
                tubes: [
                  {
                    id: 'recTube1',
                    practicalTitle_i18n: { fr: 'Monter une étagère FR' },
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
                            duration: '00:03:31',
                            locale: 'fr-fr',
                          },
                        ],
                      },
                      {
                        id: 'recSkillId2',
                        nom: '@skill2',
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

      it('should return campaign analysis with status code 200', async function () {
        // given
        const url = `/api/campaigns/${campaign.id}/analyses`;
        const request = {
          method: 'GET',
          url,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        const expectedResult = {
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
                'tube-practical-title': 'Monter une étagère FR',
                'average-score': 30,
                'tube-description': 'Comment monter une étagère',
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
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });
  });
});
