import * as campaignAssessmentParticipationResultListRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-assessment-participation-result-list-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect, learningContentBuilder, mockLearningContent } from '../../../../../test-helper.js';
const { STARTED } = CampaignParticipationStatuses;
const { buildCampaign, buildStage, buildStageAcquisition, buildCampaignParticipation } = databaseBuilder.factory;

describe('Integration | Repository | Campaign Assessment Participation Result List', function () {
  describe('#findPaginatedByCampaignId', function () {
    let campaign;

    context('when participants have not retried', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The good',
            campaignId: campaign.id,
          },
          {
            firstName: 'John',
            lastName: 'Doe',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: STARTED,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The ugly',
        });

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('returns the list of participations shared for the given campaign', async function () {
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations).to.have.lengthOf(1);
        expect(participations[0]).to.include({
          firstName: 'John',
          lastName: 'Doe',
          participantExternalId: 'The good',
        });
      });
    });

    context('when a participant has retried', function () {
      let userId, learner;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);
        userId = databaseBuilder.factory.buildUser().id;
        learner = databaseBuilder.factory.buildOrganizationLearner({ userId: userId });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'My first',
          campaignId: campaign.id,
          isImproved: true,
          organizationLearnerId: learner.id,
          userId,
          createdAt: new Date(2023, 10, 1),
        });

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('returns the list of participations shared for the given campaign', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'My middle',
          campaignId: campaign.id,
          isImproved: true,
          organizationLearnerId: learner.id,
          userId,
          createdAt: new Date(2023, 10, 2),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'My last',
          campaignId: campaign.id,
          isImproved: false,
          organizationLearnerId: learner.id,
          userId,
          createdAt: new Date(2023, 10, 3),
        });
        await databaseBuilder.commit();

        //when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });
        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].participantExternalId).to.equal('My last');
      });

      it('returns the list of last participations shared for the given campaign', async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'My last',
          campaignId: campaign.id,
          isImproved: false,
          status: STARTED,
          createdAt: new Date(2023, 10, 3),
          userId,
        });

        await databaseBuilder.commit();

        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations).to.have.lengthOf(1);
        expect(participations[0].participantExternalId).to.equal('My first');
      });

      it('should return count of shared participation for given campaign', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'Second Participation Shared',
          campaignId: campaign.id,
          isImproved: true,
          organizationLearnerId: learner.id,
          userId,
          createdAt: new Date(2022, 10, 2),
          sharedAt: new Date(2022, 10, 3),
        });
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'third Participation not shared',
          campaignId: campaign.id,
          isImproved: false,
          organizationLearnerId: learner.id,
          status: CampaignParticipationStatuses.STARTED,
          userId,
          createdAt: new Date(2022, 10, 4),
          sharedAt: new Date(2022, 10, 5),
        });

        await databaseBuilder.commit();

        //when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });
        // then
        expect(participations[0].sharedResultCount).to.equal(2);
      });
    });

    context('when there is an organization learner', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            firstName: 'Joe',
            lastName: 'Le taxi',
            organizationId: campaign.organizationId,
          },
          {
            campaignId: campaign.id,
          },
        );
        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('returns the name from the organization learner', async function () {
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations).to.have.lengthOf(1);
        expect(participations[0]).to.include({
          firstName: 'Joe',
          lastName: 'Le taxi',
        });
      });
    });

    context('when there are badges acquired', function () {
      let badge1Id, badge2Id;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);
        const { id: userId } = databaseBuilder.factory.buildUser({
          firstName: 'Jane',
          lastName: 'Le uber',
        });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
        });
        badge1Id = databaseBuilder.factory.buildBadge({
          key: 'Badge1',
          targetProfileId: campaign.targetProfileId,
          title: 'BadgeTitle',
          altMessage: 'BadgeMessage',
          imageUrl: 'BadgeImageUrl',
        }).id;
        badge2Id = databaseBuilder.factory.buildBadge({ key: 'Badge2' }).id;

        databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: badge1Id, campaignParticipationId });
        databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: badge2Id });
        await databaseBuilder.commit();
        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('returns acquired badges during the campaign', async function () {
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations[0].badges).to.deep.equal([
          {
            id: badge1Id,
            title: 'BadgeTitle',
            altMessage: 'BadgeMessage',
            imageUrl: 'BadgeImageUrl',
          },
        ]);
      });
    });

    context('when there is a participation deleted', function () {
      beforeEach(async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId: campaign.id,
          deletedAt: new Date('2022-03-31'),
          deletedBy: userId,
        });
        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('does not return deleted participations', async function () {
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations).to.be.empty;
      });
    });

    context('masteryRate', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [
          { id: 'Skill1' },
          { id: 'Skill2' },
          { id: 'Skill3' },
        ]);

        const { id: userId } = databaseBuilder.factory.buildUser({});

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          masteryRate: 0.33,
        });

        await databaseBuilder.commit();
        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1' }, { id: 'Skill2' }, { id: 'Skill3' }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('computes the mastery percentage', async function () {
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        expect(participations[0].masteryRate).to.equal(0.33);
      });
    });

    context('evolution', function () {
      let userId, organizationLearnerId;
      let organizationId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser({}).id;

        organizationId = databaseBuilder.factory.buildOrganization().id;

        organizationLearnerId = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Sarah',
          lastName: 'Croche',
          organizationId,
          userId,
        }).id;

        campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId,
          multipleSendings: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          masteryRate: 0.33,
          isImproved: false,
          createdAt: new Date('2024-01-05'),
          sharedAt: new Date('2024-01-06'),
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();
      });

      it('should compute correct evolution for participations', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          masteryRate: 0.66,
          isImproved: true,
          createdAt: new Date('2024-01-01'),
          sharedAt: new Date('2024-01-02'),
          status: CampaignParticipationStatuses.SHARED,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          masteryRate: 0,
          isImproved: true,
          createdAt: new Date('2024-01-03'),
          sharedAt: new Date('2024-01-04'),
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        // then
        expect(participations[0].evolution).to.equal('increase');
      });

      it('should return evolution null when previous participation is deleted', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          masteryRate: 0,
          isImproved: true,
          createdAt: new Date('2024-01-03'),
          sharedAt: new Date('2024-01-04'),
          deletedAt: new Date('2024-01-05'),
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        // then
        expect(participations[0].evolution).to.equal(null);
      });

      it('should return evolution null when participation does not belong to learner', async function () {
        // given
        const otherUserId = databaseBuilder.factory.buildUser({}).id;

        const otherOrganizationLearnerId =
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            firstname: 'John',
            lastname: 'Doe',
            userId: otherUserId,
            organizationId,
          }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: otherUserId,
          organizationLearnerId: otherOrganizationLearnerId,
          masteryRate: 0,
          isImproved: false,
          createdAt: new Date('2024-01-03'),
          sharedAt: new Date('2024-01-04'),
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        // then
        expect(participations).lengthOf(2);
        expect(participations[0].evolution).to.equal(null);
        expect(participations[1].evolution).to.equal(null);
      });

      it('should return evolution null when learner has 2 participations to different campaigns', async function () {
        // given
        const otherCampaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId,
          multipleSendings: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          userId,
          organizationLearnerId,
          masteryRate: 0.66,
          isImproved: false,
          createdAt: new Date('2024-01-03'),
          sharedAt: new Date('2024-01-04'),
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });

        // then
        expect(participations[0].evolution).to.equal(null);
      });
    });

    context('order', function () {
      it('should return participants data summary ordered by last name then first name asc (including organization learner data)', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId }, [{ id: 'Skill1' }]);
        const campaignParticipation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jaja', lastName: 'Le raplapla', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jiji', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jojo', lastName: 'le rococo', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'juju', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true,
        );

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
        });
        const names = participations.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'Jiji', 'juju', 'Jojo']);
      });
    });

    context('pagination', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        const participation = {
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation);
        databaseBuilder.factory.buildAssessmentFromParticipation(participation);

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('should return paginated campaign participations based on the given size and number', async function () {
        const page = { size: 1, number: 1 };

        const { participations, pagination } =
          await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            page,
          });
        const participantExternalIds = participations.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', function () {
        beforeEach(async function () {
          campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

          const participation = {
            campaignId: campaign.id,
          };

          for (let i = 0; i < 11; i++) {
            databaseBuilder.factory.buildAssessmentFromParticipation(participation);
          }

          await databaseBuilder.commit();
        });

        it('should return the first page with 10 elements', async function () {
          const { participations, pagination } =
            await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,
            });
          const participantExternalIds = participations.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(10);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 10, rowCount: 11 });
        });
      });

      context('when there are zero rows', function () {
        beforeEach(async function () {
          campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

          await databaseBuilder.commit();
        });

        it('should return the first page with O elements', async function () {
          const { participations, pagination } =
            await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,
            });
          const participantExternalIds = participations.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 10, rowCount: 0 });
        });
      });
    });

    context('when there is a filter on division', function () {
      it('returns participants which have the correct division', async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        const participation1 = {
          participantExternalId: 'The good',
          campaignId: campaign.id,
        };
        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, {
          organizationId: campaign.organizationId,
          division: 'Good Guys Team',
        });

        const participation2 = {
          participantExternalId: 'The bad',
          campaignId: campaign.id,
        };
        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, {
          organizationId: campaign.organizationId,
          division: 'Bad Guys Team',
        });

        const participation3 = {
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, {
          organizationId: campaign.organizationId,
          division: 'Ugly Guys Team',
        });

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { divisions: ['Good Guys Team', 'Ugly Guys Team'] },
        });

        const participantExternalIds = participations.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('when there is a filter on badges', function () {
      let badge1;
      let badge2;
      let user1;
      let user2;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: campaign.targetProfileId });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: campaign.targetProfileId });
        user1 = databaseBuilder.factory.buildUser();
        user2 = databaseBuilder.factory.buildUser();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        databaseBuilder.factory.learningContent.build(learningContentObjects);
        await databaseBuilder.commit();
      });

      it('returns participants which have one badge', async function () {
        const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
          participantExternalId: 'The good',
        });
        databaseBuilder.factory.buildAssessment({
          userId: user1.id,
          campaignParticipationId: campaignParticipation1.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: user1.id,
          campaignParticipationId: campaignParticipation1.id,
        });

        const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2.id,
          participantExternalId: 'The bad',
        });
        databaseBuilder.factory.buildAssessment({
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });
        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { badges: [badge1.id] },
        });

        const participantExternalIds = participations.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
      });

      it('returns participants which have several badges', async function () {
        const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
          participantExternalId: 'The good',
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: user1.id,
          campaignParticipationId: campaignParticipation1.id,
        });

        const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2.id,
          participantExternalId: 'The bad',
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { badges: [badge1.id, badge2.id] },
        });

        const participantExternalIds = participations.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The bad']);
      });

      it('should not return participants which has not shared but has the badge', async function () {
        const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
          participantExternalId: 'The good',
        });
        databaseBuilder.factory.buildAssessment({
          userId: user1.id,
          campaignParticipationId: campaignParticipation1.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: user1.id,
          campaignParticipationId: campaignParticipation1.id,
        });

        const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2.id,
          participantExternalId: 'The bad',
          status: STARTED,
        });
        databaseBuilder.factory.buildAssessment({
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: user2.id,
          campaignParticipationId: campaignParticipation2.id,
        });
        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { badges: [badge1.id] },
        });

        const participantExternalIds = participations.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
      });
    });

    context('when there is a filter on unacquiredBadges', function () {
      let badge1, badge2;
      let user1, user2;
      let participation1, participation2;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: campaign.targetProfileId });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: campaign.targetProfileId });
        user1 = databaseBuilder.factory.buildUser();
        user2 = databaseBuilder.factory.buildUser();

        participation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
        });
        participation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2.id,
        });

        await databaseBuilder.commit();
      });

      it('returns participants which does not have badge1', async function () {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: participation1.userId,
          campaignParticipationId: participation1.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          userId: participation2.userId,
          campaignParticipationId: participation2.id,
        });
        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { unacquiredBadges: [badge1.id] },
        });

        const participantExternalIds = participations.map((result) => result.campaignParticipationId);

        // then
        expect(participantExternalIds).to.exactlyContain([participation2.id]);
      });

      it('returns participants which does not have badge1 nor badge2', async function () {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: participation1.userId,
          campaignParticipationId: participation1.id,
        });
        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { unacquiredBadges: [badge1.id, badge2.id] },
        });

        const participantExternalIds = participations.map((result) => result.campaignParticipationId);

        // then
        expect(participantExternalIds).to.exactlyContain([participation2.id]);
      });

      it('returns no participant that have badge1 or badge2', async function () {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: participation1.userId,
          campaignParticipationId: participation1.id,
        });

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          userId: participation2.userId,
          campaignParticipationId: participation2.id,
        });
        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { unacquiredBadges: [badge1.id, badge2.id] },
        });

        // then
        expect(participations).to.be.empty;
      });
    });

    context('when there is a filter on both unacquiredBadges and badges', function () {
      let badge1;
      let user1;
      let participation1;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: campaign.targetProfileId });
        user1 = databaseBuilder.factory.buildUser();

        participation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
        });
        await databaseBuilder.commit();
      });

      it('returns no participant if acquired and unacquired badge have an id in common', async function () {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          userId: participation1.userId,
          campaignParticipationId: participation1.id,
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { badges: [badge1.id], unacquiredBadges: [badge1.id] },
        });

        // then
        expect(participations).to.be.empty;
      });
    });

    context('when there is a filter on stage', function () {
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
                    skills: [{ id: 'Skill1' }, { id: 'Skill2' }, { id: 'Skill3' }, { id: 'Skill4' }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('retrieves participants who have reached the specified stage', async function () {
        campaign = buildCampaign();

        const stage1Id = buildStage({
          targetProfileId: campaign.targetProfileId,
          level: 0,
          threshold: null,
          isFirstSkill: false,
        }).id;
        const stage2Id = buildStage({
          targetProfileId: campaign.targetProfileId,
          level: null,
          threshold: null,
          isFirstSkill: true,
        }).id;
        const stage3Id = buildStage({
          targetProfileId: campaign.targetProfileId,
          level: 1,
          threshold: null,
          isFirstSkill: false,
        }).id;
        const stage4Id = buildStage({
          targetProfileId: campaign.targetProfileId,
          level: 2,
          threshold: null,
          isFirstSkill: false,
        }).id;

        [
          { campaignParticipationId: 1, stageAcquiredIds: [stage1Id, stage2Id] },
          { campaignParticipationId: 2, stageAcquiredIds: [stage1Id, stage2Id, stage3Id] },
          { campaignParticipationId: 3, stageAcquiredIds: [stage1Id] },
          { campaignParticipationId: 4, stageAcquiredIds: [stage1Id, stage2Id] },
          { campaignParticipationId: 5, stageAcquiredIds: [stage1Id, stage2Id, stage3Id, stage4Id] },
        ].forEach(({ campaignParticipationId, stageAcquiredIds }) => {
          buildCampaignParticipation({
            id: campaignParticipationId,
            campaignId: campaign.id,
          });

          stageAcquiredIds.forEach((stageAcquiredId) =>
            buildStageAcquisition({
              stageId: stageAcquiredId,
              campaignParticipationId,
            }),
          );
        });

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { stages: [stage2Id, stage3Id] },
        });

        const participantIds = participations.map(({ campaignParticipationId }) => campaignParticipationId);

        // then
        expect(participantIds).to.exactlyContain([1, 2, 4]);
      });
    });

    context('when there is a filter on groups', function () {
      it('returns participants which have the correct groups', async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        const participation1 = {
          participantExternalId: 'Sans',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, {
          organizationId: campaign.organizationId,
          group: 'Bad Puns Team',
        });

        const participation2 = {
          participantExternalId: 'Papyrus',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, {
          organizationId: campaign.organizationId,
          group: 'Royal Guard',
        });

        const participation3 = {
          participantExternalId: 'Asriel',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, {
          organizationId: campaign.organizationId,
          group: 'Adoptive Brother',
        });

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { groups: ['Royal Guard', 'Bad Puns Team'] },
        });

        const participantExternalIds = participations.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['Sans', 'Papyrus']);
      });
    });

    context('when there is a filter on the firstname and lastname', function () {
      beforeEach(async function () {
        // given
        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill1' }]);

        await databaseBuilder.commit();

        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [{ id: 'Skill1', name: '@Acquis1', challenges: [] }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        await mockLearningContent(learningContentObjects);
      });

      it('returns all participants if the filter is empty', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Saphira',
            lastName: 'Eurasier',
          },
        );

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: '' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
      });

      it('return Choupette participant when we search part its firstname', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The boy',
            campaignId: campaign.id,
          },
          {
            firstName: 'Salto',
            lastName: 'Irish terrier',
          },
        );

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Chou' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search contains a space before', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: ' Cho' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search contains a space after', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Cho ' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search part its lastname', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The boy',
            campaignId: campaign.id,
          },
          {
            firstName: 'Salto',
            lastName: 'Irish terrier',
          },
        );

        await databaseBuilder.commit();
        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Eura' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].lastName).to.equal('Eurasier');
      });

      it('return Choupette participant when we search part its fullname', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The boy',
            campaignId: campaign.id,
          },
          {
            firstName: 'Salto',
            lastName: 'Irish terrier',
          },
        );

        await databaseBuilder.commit();
        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Choupette E' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant only for the involved campaign when we search part of its full name', async function () {
        const otherCampaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'Skill2' }]);

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Eurasier',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: otherCampaign.id,
          },
          {
            firstName: 'Choupette',
            lastName: 'Wrong',
          },
        );

        await databaseBuilder.commit();

        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Choupette' },
        });

        // then
        expect(participations).to.have.lengthOf(1);
        expect(participations[0].lastName).to.equal('Eurasier');
      });

      it('return all participants when we search similar part of firstname', async function () {
        // given
        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The boy',
            campaignId: campaign.id,
          },
          {
            firstName: 'Salto',
            lastName: 'Irish terrier',
          },
        );

        databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            participantExternalId: 'The girl',
            campaignId: campaign.id,
          },
          {
            firstName: 'Saphira',
            lastName: 'Young',
          },
        );

        await databaseBuilder.commit();
        // when
        const { participations } = await campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: 'Sa' },
        });

        // then
        expect(participations).to.have.lengthOf(2);
        expect(participations[0].firstName).to.equal('Salto');
        expect(participations[1].firstName).to.equal('Saphira');
      });
    });
  });
});
