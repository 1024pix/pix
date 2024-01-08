import { createServer } from '../../../../../server.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import {
  expect,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | API | campaign-results-route', function () {
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
});
