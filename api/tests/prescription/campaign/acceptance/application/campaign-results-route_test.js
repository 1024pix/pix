import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | campaign-results-route', function () {
  let campaign;
  let organization;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns/{id}/assessment-results', function () {
    const participant1 = { firstName: 'John', lastName: 'McClane', id: 12, email: 'john.mclane@die.hard' };
    const participant2 = { firstName: 'Holly', lastName: 'McClane', id: 13, email: 'holly.mclane@die.hard' };

    let campaign;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });

      const skill = { id: 'Skill1', name: '@Acquis1', challenges: [] };
      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [skill],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId: organization.id }, [skill]);

      const campaignParticipation = {
        participantExternalId: 'Die Hard',
        sharedAt: new Date(2010, 1, 1),
        campaignId: campaign.id,
      };

      databaseBuilder.factory.buildAssessmentFromParticipation(
        campaignParticipation,
        {
          organizationId: organization.id,
          division: '5eme',
          firstName: 'John',
          lastName: 'McClane',
        },
        participant1,
      );
      databaseBuilder.factory.buildAssessmentFromParticipation(
        campaignParticipation,
        {
          organizationId: organization.id,
          division: '4eme',
          firstName: 'Holly',
          lastName: 'McClane',
        },
        participant2,
      );

      return databaseBuilder.commit();
    });

    it('should return the participation results for an assessment campaign', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/assessment-results?page[number]=1&page[size]=10&filter[divisions][]=5eme`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant1.firstName);
    });

    it('should return the participation results for an assessment campaign filtered by search as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/assessment-results?page[number]=1&page[size]=10&filter[search]=Holly M`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(participant2.firstName);
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
});
