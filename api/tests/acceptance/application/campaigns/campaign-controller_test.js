import jwt from 'jsonwebtoken';

import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { config as settings } from '../../../../lib/config.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { createServer } from '../../../../server.js';

const { STARTED } = CampaignParticipationStatuses;

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

  describe('GET /api/campaigns/{id}/csv-assessment-results', function () {
    let accessToken;

    function _createTokenWithAccessId({ userId, campaignId }) {
      return jwt.sign(
        {
          access_id: userId,
          campaign_id: campaignId,
        },
        settings.authentication.secret,
        { expiresIn: settings.authentication.accessTokenLifespanMs },
      );
    }

    beforeEach(async function () {
      const skillId = 'rec123';
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId });
      accessToken = _createTokenWithAccessId({ userId, campaignId: campaign.id });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
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
                      id: skillId,
                      nom: '@web2',
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

    it('should return csv file with statusCode 200', async function () {
      // given & when
      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/csv-assessment-results?accessToken=${accessToken}`,
      });

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-assessment-results?accessToken=${accessToken}`,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/campaigns/{id}/csv-profiles-collection-results', function () {
    let accessToken;

    function _createTokenWithAccessId({ userId, campaignId }) {
      return jwt.sign(
        {
          access_id: userId,
          campaign_id: campaignId,
        },
        settings.authentication.secret,
        { expiresIn: settings.authentication.accessTokenLifespanMs },
      );
    }

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: 'PROFILES_COLLECTION',
      });
      accessToken = _createTokenWithAccessId({ userId, campaignId: campaign.id });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
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
                      id: 'recSkill1',
                      nom: '@web2',
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

    it('should return csv file with statusCode 200', async function () {
      // given & when
      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/csv-profiles-collection-results?accessToken=${accessToken}`,
      });

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-profiles-collection-results?accessToken=${accessToken}`,
        });

        // then
        expect(statusCode).to.equal(403);
      });
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

  describe('GET /api/campaigns/{id}/profiles-collection-participations', function () {
    beforeEach(async function () {
      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'skill1',
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

    context('Division filter', function () {
      context('when there is one divisions', function () {
        it('should returns profiles collection campaign participations', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: organization.id,
            organizationRole: Membership.roles.MEMBER,
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            name: 'Campagne de Test N°3',
            organizationId: organization.id,
          });

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Barry',
              lastName: 'White',
              organizationId: organization.id,
              division: 'Division Barry',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Marvin',
              lastName: 'Gaye',
              organizationId: organization.id,
              division: 'Division Marvin',
            },
            {
              campaignId: campaign.id,
            },
          );

          await databaseBuilder.commit();

          // when
          const options = {
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[divisions][]=Division+Barry`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(1);
          expect(response.result.data[0].attributes['last-name']).to.equal('White');
        });
      });

      context('when there are several divisions', function () {
        it('should returns profiles collection campaign participations', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: organization.id,
            organizationRole: Membership.roles.MEMBER,
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            name: 'Campagne de Test N°3',
            organizationId: organization.id,
          });

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Barry',
              lastName: 'White',
              organizationId: organization.id,
              division: 'Division Barry',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Marvin',
              lastName: 'Gaye',
              organizationId: organization.id,
              division: 'Division Marvin',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Aretha',
              lastName: 'Franklin',
              organizationId: organization.id,
              division: 'Division Aretha',
            },
            {
              campaignId: campaign.id,
            },
          );

          await databaseBuilder.commit();

          // when
          const options = {
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[divisions][]=Division+Marvin&filter[divisions][]=Division+Aretha`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(2);
          expect(response.result.data[1].attributes['last-name']).to.equal('Gaye');
          expect(response.result.data[0].attributes['last-name']).to.equal('Franklin');
        });
      });
    });

    context('Group filter', function () {
      context('when there is one groups', function () {
        it('should returns profiles collection campaign participations', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: organization.id,
            organizationRole: Membership.roles.MEMBER,
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            name: 'Campagne de Test N°3',
            organizationId: organization.id,
          });

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Barry',
              lastName: 'White',
              organizationId: organization.id,
              group: 'L1',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Marvin',
              lastName: 'Gaye',
              organizationId: organization.id,
              group: 'L2',
            },
            {
              campaignId: campaign.id,
            },
          );

          await databaseBuilder.commit();

          // when
          const options = {
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[groups][]=L1`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(1);
          expect(response.result.data[0].attributes['last-name']).to.equal('White');
        });
      });

      context('when there are several groups', function () {
        it('should returns profiles collection campaign participations', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: organization.id,
            organizationRole: Membership.roles.MEMBER,
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            name: 'Campagne de Test N°3',
            organizationId: organization.id,
          });

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Barry',
              lastName: 'White',
              organizationId: organization.id,
              group: 'L1',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Marvin',
              lastName: 'Gaye',
              organizationId: organization.id,
              group: 'L2',
            },
            {
              campaignId: campaign.id,
            },
          );

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            {
              firstName: 'Aretha',
              lastName: 'Franklin',
              organizationId: organization.id,
              group: 'L3',
            },
            {
              campaignId: campaign.id,
            },
          );

          await databaseBuilder.commit();

          // when
          const options = {
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[groups][]=L3&filter[groups][]=L2`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(2);
          expect(response.result.data[1].attributes['last-name']).to.equal('Gaye');
          expect(response.result.data[0].attributes['last-name']).to.equal('Franklin');
        });
      });
    });

    context('Search filter', function () {
      it('should returns profiles collection campaign participations', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.MEMBER,
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          name: 'Campagne de Test N°3',
          organizationId: organization.id,
        });

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            firstName: 'Barry',
            lastName: 'White',
            organizationId: organization.id,
            group: 'L1',
          },
          {
            campaignId: campaign.id,
          },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            firstName: 'Marvin',
            lastName: 'Gaye',
            organizationId: organization.id,
            group: 'L2',
          },
          {
            campaignId: campaign.id,
          },
        );

        await databaseBuilder.commit();

        // when
        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[search]=Marvin G`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].attributes['last-name']).to.equal('Gaye');
      });
    });

    context('Search certificability filter', function () {
      it('should returns profiles who are certifiable', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.MEMBER,
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          name: 'Campagne de Test N°3',
          organizationId: organization.id,
        });

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            firstName: 'Barry',
            lastName: 'White',
            organizationId: organization.id,
            group: 'L1',
          },
          {
            campaignId: campaign.id,
            isCertifiable: true,
          },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            firstName: 'Marvin',
            lastName: 'Gaye',
            organizationId: organization.id,
            group: 'L2',
          },
          {
            campaignId: campaign.id,
            isCertifiable: false,
          },
        );

        await databaseBuilder.commit();

        // when
        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/profiles-collection-participations?filter[certificability]=eligible`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].attributes['last-name']).to.equal('White');
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

  describe('GET /api/campaigns/{id}/participants-activity', function () {
    const participant1 = { firstName: 'John', lastName: 'McClane', division: '5eme' };
    const participant2 = { firstName: 'Holly', lastName: 'McClane', division: '4eme' };
    const participant3 = { firstName: 'Mary', lastName: 'McClane', group: 'L1' };

    let campaign;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const campaignParticipation = {
        sharedAt: new Date(2010, 1, 1),
        campaignId: campaign.id,
      };

      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, {
        campaignId: campaign.id,
        status: STARTED,
      });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant3, {
        campaignId: campaign.id,
      });
      return databaseBuilder.commit();
    });

    it('should return a list of participation as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(3);
    });

    it('should return two pages as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?page[number]=1&page[size]=1`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const meta = response.result.meta;
      expect(meta.pageCount).to.equal(3);
    });

    it('should return the campaign participant activity from division 5eme as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[divisions][]=5eme`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant1.firstName);
    });

    it('should return the campaign participant activity with status STARTED as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=STARTED`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant2.firstName);
    });

    it('should return the campaign participant activity filtered by search as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[search]=Mary M`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant3.firstName);
    });

    it('should return the campaign participant activity with group L1 as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[groups][]=L1`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant3.firstName);
    });

    it('should return 400 when status is not valid', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=bad`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(400);
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
