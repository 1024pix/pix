import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintItem } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprintItem.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | find-combined-course-blueprint-by-id', function () {
  it('should return a combined course blueprint', async function () {
    // given
    const targetProfile = databaseBuilder.factory.buildTargetProfile({
      name: 'Diagnostic',
    });
    const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
    const quest = databaseBuilder.factory.buildQuest({
      rewardType: null,
      rewardId: null,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId: targetProfile.id,
        }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          moduleId,
        }).toDTO(),
      ],
    });

    const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({
      name: 'Schéma de parcours combiné',
      questId: quest.id,
    });

    const trainingId = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/demo-combinix-1',
    }).id;
    databaseBuilder.factory.buildTargetProfileTraining({
      trainingId,
      targetProfileId: targetProfile.id,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.findCombinedCourseBlueprintById({
      id: combinedCourseBlueprint.id,
    });

    // then
    expect(result).instanceOf(CombinedCourseBlueprint);
    expect(result).to.deep.equal({
      createdAt: combinedCourseBlueprint.createdAt,
      description: combinedCourseBlueprint.description,
      id: combinedCourseBlueprint.id,
      illustration: combinedCourseBlueprint.illustration,
      internalName: combinedCourseBlueprint.internalName,
      name: combinedCourseBlueprint.name,
      updatedAt: combinedCourseBlueprint.updatedAt,
      surveyLink: null,
      organizationIds: [],
      items: [
        new CombinedCourseBlueprintItem({
          id: targetProfile.id,
          name: 'Diagnostic',
        }),
        new CombinedCourseBlueprintItem({
          id: moduleId,
          name: 'Demo combinix 1',
          duration: 1,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          isRecommendable: true,
        }),
      ],
      quest: {
        createdAt: quest.createdAt,
        id: quest.id,
        rewardId: quest.rewardId,
        rewardType: quest.rewardType,
        updatedAt: quest.updatedAt,
      },
    });
  });
});
