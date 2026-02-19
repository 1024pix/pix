import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Combined course | Domain | UseCases | create-combined-course', function () {
  it('should create combined course for given payload', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    const targetProfile = databaseBuilder.factory.buildTargetProfile();

    const targetProfileWithTraining = databaseBuilder.factory.buildTargetProfile();
    const trainingId = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      title: 'Demo combinix 1',
      link: '/modules/demo-combinix-1',
      locale: 'fr-fr',
    }).id;

    databaseBuilder.factory.buildTargetProfileTraining({
      targetProfileId: targetProfileWithTraining.id,
      trainingId: trainingId,
    });

    const {
      id: combinedCourseBlueprintId,
      description,
      illustration,
    } = databaseBuilder.factory.buildCombinedCourseBlueprint({
      content: [
        { type: 'evaluation', value: targetProfile.id },
        { type: 'module', value: '27d6ca4f' },
        { type: 'module', value: 'df82ec66' },
      ],
    });

    await databaseBuilder.commit();

    const nameInput = 'Un parcours combiné';

    // when
    await usecases.createCombinedCourse({
      name: nameInput,
      combinedCourseBlueprintId,
      creatorId: userId,
      organizationId,
    });

    const [createdCampaign] = await knex('campaigns')
      .where({ organizationId })
      .whereIn('targetProfileId', [targetProfile.id, targetProfileWithTraining.id])
      .orderBy('id');

    const expectedModules = [
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
        comparison: CRITERION_COMPARISONS.ALL,
        data: {
          moduleId: {
            data: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
          isTerminated: {
            data: true,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
        comparison: CRITERION_COMPARISONS.ALL,
        data: {
          moduleId: {
            data: 'f32a2238-4f65-4698-b486-15d51935d335',
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
          isTerminated: {
            data: true,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
    ];

    const expectedCreatedQuest = {
      name: nameInput,
      rewardType: null,
      rewardId: null,
      organizationId,
      eligibilityRequirements: [],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: createdCampaign.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
        ...expectedModules,
      ],
      description,
      illustration,
    };

    // then
    const [createdQuest] = await knex('quests')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', organizationId)
      .orderBy('quests.id');

    // Quest
    expect(createdQuest.combinedCourseBlueprintId).to.equal(combinedCourseBlueprintId);
    expect(createdQuest.code).not.to.be.null;
    expect(createdQuest.name).to.equal(nameInput);
    expect(createdQuest.successRequirements).to.deep.equal(createdQuest.successRequirements);
    expect(createdQuest.description).to.equal(expectedCreatedQuest.description);
    expect(createdQuest.illustration).to.equal(expectedCreatedQuest.illustration);

    //Campaign 1
    expect(createdCampaign.name).to.equal(targetProfile.internalName);
    expect(createdCampaign.title).to.equal(targetProfile.name);
    expect(createdCampaign.customResultPageButtonUrl.includes('/chargement')).false;
    expect(createdCampaign.customResultPageButtonText).to.equal('Continuer');
  });
});
