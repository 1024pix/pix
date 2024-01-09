import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { Membership } from '../../../../lib/domain/models/Membership.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | Campaign Controller', function () {
  let campaign;
  let organization;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns', function () {
    it('should return the campaign requested by code', async function () {
      // given
      campaign = databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/campaigns/?filter[code]=${campaign.code}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.code).to.equal(campaign.code);
      expect(response.result.data.attributes.type).to.equal(campaign.type);
      expect(response.result.data.attributes.title).to.equal(campaign.title);
      expect(response.result.data.attributes['is-for-absolute-novice']).to.equal(campaign.isForAbsoluteNovice);
      expect(response.result.data.attributes['id-pix-label']).to.equal(campaign.idPixLabel);
    });
  });

  describe('GET /api/campaigns/{id}/collective-result', function () {
    const assessmentStartDate = '2018-01-02';
    const participationStartDate = '2018-01-01';

    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°2',
        organizationId: organization.id,
        idPixLabel: 'Identifiant entreprise',
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkillId1' });

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

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        createdAt: new Date(participationStartDate),
        sharedAt: new Date('2018-01-27'),
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        userId,
        type: 'CAMPAIGN',
        createdAt: new Date(assessmentStartDate),
        campaignParticipationId: campaignParticipation.id,
      });

      databaseBuilder.factory.buildKnowledgeElement({
        skillId: 'recSkillId1',
        status: 'validated',
        userId,
        assessmentId: assessment.id,
        competenceId: 'recCompetence1',
        createdAt: new Date('2017-12-01'),
      });

      await databaseBuilder.commit();

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

    it('should return campaign collective result with status code 200', async function () {
      // given
      const url = `/api/campaigns/${campaign.id}/collective-results`;
      const request = {
        method: 'GET',
        url,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedResult = {
        data: {
          type: 'campaign-collective-results',
          id: campaign.id.toString(),
          attributes: {},
          relationships: {
            'campaign-competence-collective-results': {
              data: [
                {
                  id: `${campaign.id}_recCompetence1`,
                  type: 'campaignCompetenceCollectiveResults',
                },
              ],
            },
          },
        },
        included: [
          {
            id: `${campaign.id}_recCompetence1`,
            type: 'campaignCompetenceCollectiveResults',
            attributes: {
              'area-code': '1',
              'area-color': 'specialColor',
              'average-validated-skills': 1,
              'competence-id': 'recCompetence1',
              'competence-name': 'Fabriquer un meuble',
              'targeted-skills-count': 2,
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

  describe('GET /api/campaigns/{id}/analyses', function () {
    let userId;

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

  describe('GET /api/campaigns/{id}/divisions', function () {
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

  describe('GET /api/campaigns/{id}/groups', function () {
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

  describe('PATCH /api/campaigns/{id}', function () {
    it('should return 200 when user is admin but not owner of the campaign', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId: organization.id });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'toto',
              title: null,
              'custom-landing-page-text': 'toto',
              'owner-id': userId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 403 when user is not an admin and is not the campaign owner', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        creatorId: databaseBuilder.factory.buildUser({ id: 3 }).id,
        ownerId: databaseBuilder.factory.buildUser({ id: 2 }).id,
      });
      const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'MEMBER', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'toto',
              title: null,
              'custom-landing-page-text': 'toto',
              'owner-id': userId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PUT /api/campaigns/{id}/archive', function () {
    it('should return 200 when user is admin in organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId: organization.id });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/campaigns/${campaign.id}/archive`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 403 when user is not owner of the campaign', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        creatorId: databaseBuilder.factory.buildUser({ id: 3 }).id,
        ownerId: databaseBuilder.factory.buildUser({ id: 2 }).id,
      });
      const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'MEMBER', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/campaigns/${campaign.id}/archive`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('DELETE /api/campaigns/{id}/archive', function () {
    it('should return 200 when user is admin in organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId: organization.id });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/campaigns/${campaign.id}/archive`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 403 when user is not owner of the campaign', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        creatorId: databaseBuilder.factory.buildUser({ id: 3 }).id,
        ownerId: databaseBuilder.factory.buildUser({ id: 2 }).id,
      });
      const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'MEMBER', organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/campaigns/${campaign.id}/archive`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
