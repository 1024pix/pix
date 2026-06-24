import nock from 'nock';
import sinon from 'sinon';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | Quest | Domain | UseCases | update-combined-course-progress', function () {
  let clock;
  const now = new Date('2025-07-07');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when combined course is completed', function () {
    it('should synchronize and update combined course if it is completed', async function () {
      const code = 'SOMETHING';
      const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
      const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const trainingId = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' }).id;
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId });

      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId,
      });

      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: CampaignParticipationStatuses.SHARED,
      }).id;
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: trainingId,
        campaignParticipationId,
      });

      // build terminated passages and started OrganizationLearnerParticipation Passages to validate right synchronization
      databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        organizationLearnerId,
        moduleId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });

      const combinedCourseParticipation =
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          organizationLearnerId,
          combinedCourseId,
          createdAt: new Date('2022-01-01'),
          updatedAt: new Date('2022-01-01'),
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });
      await databaseBuilder.commit();

      await usecases.updateCombinedCourseProgress({ userId, code });

      const result = await knex('organization_learner_participations')
        .where({ id: combinedCourseParticipation.id })
        .first();

      expect(result.status).to.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      expect(result.updatedAt).to.deep.equal(now);
    });

    context('when combined course contains a reward', function () {
      it('should reward the user', async function () {
        const code = 'SOMETHING';
        const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
        const {
          id: organizationLearnerId,
          userId,
          organizationId,
        } = databaseBuilder.factory.buildOrganizationLearner();
        const skillId = 'web1';
        const tubeId = 'recTube1';
        const competenceId = 'recAbe382T0e1337';
        const competence = {
          id: competenceId,
          areaId: 'recvoGdo7z2z7pXWa',
        };
        const area = {
          id: 'recvoGdo7z2z7pXWa',
          competenceIds: [competenceId],
        };
        const learningContent = [
          {
            ...area,
            competences: [
              {
                ...competence,
                tubes: [
                  {
                    id: tubeId,
                    skills: [
                      {
                        id: skillId,
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        databaseBuilder.factory.learningContent.build(learningContentObjects);
        databaseBuilder.factory.buildKnowledgeElement({
          skillId,
          competenceId,
          userId,
        });
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId });
        const reward = databaseBuilder.factory.buildAttestation();
        const { id: rewardQuestId } = databaseBuilder.factory.buildQuestForCombinedCourse({
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO(),
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO(),
            {
              requirement_type: 'cappedTubes',
              data: {
                threshold: 100,
                cappedTubes: [{ tubeId, level: 1 }],
              },
            },
          ],
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId: reward.id,
        });
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          code,
          organizationId,
          questId: rewardQuestId,
        });

        // build terminated passages and started OrganizationLearnerParticipation Passages to validate right synchronization
        databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
          organizationLearnerId,
          moduleId,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          organizationLearnerId,
          combinedCourseId,
          createdAt: new Date('2022-01-01'),
          updatedAt: new Date('2022-01-01'),
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, userId });
        await databaseBuilder.commit();

        await usecases.updateCombinedCourseProgress({ userId, code });

        const profileRewards = await repositories.rewardRepository.getByUserId({ userId });

        expect(profileRewards[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
        expect(profileRewards[0].rewardId).to.equal(reward.id);
      });
    });

    context('when combined course contains no reward', function () {
      it('should not reward the user', async function () {
        /// given
        const code = 'SOMETHING';
        const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
        const {
          id: organizationLearnerId,
          userId,
          organizationId,
        } = databaseBuilder.factory.buildOrganizationLearner();
        const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({});
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          code,
          organizationId,
          questId,
        });

        // build terminated passages and started OrganizationLearnerParticipation Passages to validate right synchronization
        databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
          organizationLearnerId,
          moduleId,
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });

        databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
          organizationLearnerId,
          combinedCourseId,
          createdAt: new Date('2022-01-01'),
          updatedAt: new Date('2022-01-01'),
          status: OrganizationLearnerParticipationStatuses.STARTED,
        });
        await databaseBuilder.commit();

        // when
        await usecases.updateCombinedCourseProgress({ userId, code });

        // then
        const profileRewards = await repositories.rewardRepository.getByUserId({ userId });
        expect(profileRewards).to.be.empty;
      });
    });
  });

  it('should update organization learner participations when passage is on a recommended module', async function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    const code = 'SOMETHING';
    const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
    const module2Id = '9beb922f-4d8e-495d-9c85-0e7265ca78d6';
    const module3Id = 'd4c4a2b2-0046-471d-ad9c-15f9cfc8f1f6';

    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const trainingId = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' }).id;
    const training2Id = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/au-dela-des-mots-de-passe',
    }).id;
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId });
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId: training2Id });

    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      userId,
      organizationLearnerId,
      status: CampaignParticipationStatuses.SHARED,
    }).id;
    databaseBuilder.factory.buildUserRecommendedTraining({
      userId,
      trainingId: trainingId,
      campaignParticipationId,
    });
    databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
    databaseBuilder.factory.buildPassage({ userId, module2Id, terminatedAt: null });

    const { id: questId3 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: module2Id }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: module3Id }).toDTO(),
      ],
    });
    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      questId: questId3,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
      organizationLearnerId,
      combinedCourseId,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourseProgress({ userId, code });

    // then
    const result = await knex('organization_learner_participations').where({
      organizationLearnerId,
      type: OrganizationLearnerParticipationTypes.PASSAGE,
    });

    expect(result).to.be.lengthOf(2);
    expect(result[0].referenceId).equal(moduleId);
    expect(result[1].referenceId).equal(module3Id);
  });
  it('should not update combined course if it not completed', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: questId4 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
      ],
    });
    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      questId: questId4,
    });
    const combinedCourseParticipation =
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        organizationLearnerId,
        combinedCourseId,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourseProgress({ userId, code });

    const result = await knex('organization_learner_participations')
      .where({ id: combinedCourseParticipation.id })
      .first();

    expect(result.status).to.equal(combinedCourseParticipation.status);
    expect(result.updatedAt).to.deep.equal(combinedCourseParticipation.updatedAt);
  });

  it('should not throw if combinedCourseParticipation does not exist', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: questId5 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      questId: questId5,
    });
    await databaseBuilder.commit();

    const result = await usecases.updateCombinedCourseProgress({ userId, code });

    const participation = await knex('organization_learner_participations').where({ organizationLearnerId }).first();
    expect(participation).to.be.undefined;
    expect(result).to.not.throw;
  });

  it('should not update combined course if it is already completed', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: questId6 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
      ],
    });
    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      questId: questId6,
    });
    const combinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      organizationLearnerId,
      combinedCourseId,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourseProgress({ userId, code });

    const result = await knex('organization_learner_participations')
      .where({ id: combinedCourseParticipation.id })
      .first();

    expect(result.status).to.equal(combinedCourseParticipation.status);
    expect(result.updatedAt).to.deep.equal(combinedCourseParticipation.updatedAt);
  });
});
