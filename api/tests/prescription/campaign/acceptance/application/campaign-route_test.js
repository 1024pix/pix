import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement, Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  domainBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].attributes.name).to.equal(group);
    });
  });

  describe('GET /api/campaigns/{campaignId}/analyses', function () {
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
        await mockLearningContent(learningContentObjects);
      });

      it('should return campaign analysis with status code 200', async function () {
        // given
        const url = `/api/campaigns/${campaign.id}/analyses`;
        const request = {
          method: 'GET',
          url,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
        await mockLearningContent(learningContentObjects);
      });

      it('should return campaign analysis with status code 200', async function () {
        // given
        const url = `/api/campaigns/${campaign.id}/analyses`;
        const request = {
          method: 'GET',
          url,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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

  describe('GET /api/campaigns/{campaignId}/presentation-steps', function () {
    it('should return the presentation steps informations', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        userId,
        organizationId: organization.id,
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId: organization.id });
      const badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
      const campaign = databaseBuilder.factory.buildCampaign({
        code: 'CAMPAIGN1',
        customLandingPageText: 'landing page text',
        targetProfileId: targetProfile.id,
        organizationId: organization.id,
      });
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recFramework',
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'recArea',
        frameworkId: 'recFramework',
        competenceIds: ['recCompetence'],
      });
      const competenceDB = databaseBuilder.factory.learningContent.buildCompetence({
        id: 'recCompetence',
        index: '2',
        name_i18n: { fr: 'nom en français' },
        areaId: 'recArea',
        skillIds: ['recSkill'],
        thematicIds: ['recThematic'],
      });
      databaseBuilder.factory.learningContent.buildThematic({
        id: 'recThematic',
        competenceId: 'recCompetence',
        tubeIds: ['recTube'],
      });
      databaseBuilder.factory.learningContent.buildTube({
        id: 'recTube',
        competenceId: 'recCompetence',
        thematicId: 'recThematic',
        skillIds: ['recSkill'],
      });
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'recSkill',
        status: 'actif',
        competenceId: 'recCompetence',
        tubeId: 'recTube',
      });
      databaseBuilder.factory.buildCampaignSkill({
        campaignId: campaign.id,
        skillId: 'recSkill',
      });

      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
      });

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.code}/presentation-steps`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'campaign-presentation-steps',
          attributes: { 'custom-landing-page-text': campaign.customLandingPageText },
          relationships: {
            badges: {
              data: [
                {
                  id: String(badge.id),
                  type: 'badges',
                },
              ],
            },
            competences: {
              data: [
                {
                  id: competenceDB.id,
                  type: 'competences',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'badges',
            id: String(badge.id),
            attributes: {
              'alt-message': badge.altMessage,
              'image-url': badge.imageUrl,
              'is-always-visible': badge.isAlwaysVisible,
              'is-certifiable': badge.isCertifiable,
              key: badge.key,
              message: badge.message,
              title: badge.title,
            },
          },
          {
            type: 'competences',
            id: competenceDB.id,
            attributes: {
              index: competenceDB.index,
              name: competenceDB.name_i18n.fr,
            },
          },
        ],
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/level_by_tubes_and_competences', function () {
    let campaign, campaignId, userId;
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°3',
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillWeb1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillWeb2' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillUrl1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillUrl2' });

      const learningContentData = {
        frameworks: [{ id: 'frameworkId', name: 'frameworkName' }],
        areas: [{ id: 'recArea1', frameworkId: 'frameworkId', competenceIds: ['recCompetence1'] }],
        competences: [
          {
            id: 'recCompetence1',
            name_i18n: { fr: 'name FR Compétence 1', en: 'name EN Compétence 1' },
            description_i18n: { fr: 'description FR Compétence 1', en: 'description EN Compétence 1' },
            index: '1.1',
            skillIds: ['recSkillWeb1', 'recSkillWeb2', 'recSkillUrl1', 'recSkillUrl2'],
            areaId: 'recArea1',
            origin: 'Pix',
          },
        ],
        thematics: [],
        tubes: [
          {
            id: 'recTube1',
            name: '@tubeWeb1',
            title: 'Title recTube1',
            description: 'recTube1 description',
            practicalTitle_i18n: { fr: 'Tube 1 fr title', en: 'Tube 1 en title' },
            practicalDescription_i18n: { fr: 'recTube1 fr description', en: 'recTube1 en description' },
            competenceId: 'recCompetence1',
            skillIds: ['recSkillWeb1', 'recSkillWeb2'],
          },
          {
            id: 'recTube2',
            name: '@tubeUrl2',
            title: 'Title recTube2',
            description: 'recTube2 description',
            practicalTitle_i18n: { fr: 'Tube 2 fr title', en: 'Tube 2 en title' },
            practicalDescription_i18n: { fr: 'recTube2 fr description', en: 'recTube2 en description' },
            competenceId: 'recCompetence1',
            skillIds: ['recSkillUrl1', 'recSkillUrl2'],
          },
        ],
        skills: [
          {
            id: 'recSkillWeb1',
            name: '@web1',
            tubeId: 'recTube1',
            status: 'actif',
            level: 1,
            competenceId: 'recCompetence1',
          },
          {
            id: 'recSkillWeb2',
            name: '@web2',
            tubeId: 'recTube1',
            status: 'actif',
            level: 2,
            competenceId: 'recCompetence1',
          },
          {
            id: 'recSkillUrl1',
            name: '@url1',
            tubeId: 'recTube2',
            status: 'actif',
            level: 3,
            competenceId: 'recCompetence1',
          },
          {
            id: 'recSkillUrl2',
            name: '@url2',
            tubeId: 'recTube2',
            status: 'actif',
            level: 4,
            competenceId: 'recCompetence1',
          },
        ],
        challenges: [],
      };

      databaseBuilder.factory.learningContent.build(learningContentData);

      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();

      const participationUser1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user1.id,
      });
      const participationUser2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user2.id,
      });

      const user1ke1 = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: learningContentData.skills[0].id,
        userId: participationUser1.userId,
      });
      const user1ke2 = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: learningContentData.skills[1].id,
        userId: participationUser1.userId,
      });

      const user2ke1 = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: learningContentData.skills[2].id,
        userId: participationUser2.userId,
      });

      const user2ke2 = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: learningContentData.skills[3].id,
        userId: participationUser2.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser1.id,
        snapshot: new KnowledgeElementCollection([user1ke1, user1ke2]).toSnapshot(),
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser2.id,
        snapshot: new KnowledgeElementCollection([user2ke1, user2ke2]).toSnapshot(),
      });

      await databaseBuilder.commit();

      options.headers = generateAuthenticatedUserRequestHeaders({ userId });
      options.url = `/api/campaigns/${campaign.id}/level_by_tubes_and_competences`;
    });

    it('should return correct mean and max levels for competences and tubes', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
      expect(response.result.data.type).to.deep.equal('campaign-result-levels-per-tubes-and-competences');
    });
  });
});
