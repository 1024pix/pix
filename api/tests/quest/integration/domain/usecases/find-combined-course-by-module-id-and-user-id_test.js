import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | find-combined-course-by-module-id-and-user-id', function () {
  it('should return a combined course', async function () {
    //given
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
    const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
    const thirdOrganization = databaseBuilder.factory.buildOrganization({});

    const moduleId = 'module-abc';

    //CombinedCourse1 with module 1 and organization linked to organizationLearner1
    const { id: questId1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
    });
    const combinedCourse1 = databaseBuilder.factory.buildCombinedCourse({
      code: 'QWERTY123',
      name: 'name1',
      organizationId: organizationLearner.organizationId,
      questId: questId1,
    });

    //CombinedCourse2 with same module but organization linked to organizationLearner2
    const { id: questId2 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
    });
    const combinedCourse2 = databaseBuilder.factory.buildCombinedCourse({
      code: 'AZERTY123',
      name: 'name2',
      organizationId: otherOrganizationLearner.organizationId,
      questId: questId2,
    });

    //CombinedCourse3 with same module but with an organization not linked to user
    const { id: questId3 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'AZERTYABC',
      name: 'name2',
      organizationId: thirdOrganization.id,
      questId: questId3,
    });

    //CombinedCourse4 with other module but organization linked to user
    const { id: questId4 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'module-cde' }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'QWERTYDBE',
      name: 'name1',
      organizationId: organizationLearner.organizationId,
      questId: questId4,
    });

    await databaseBuilder.commit();

    //when
    const result = await usecases.findCombinedCourseByModuleIdAndUserId({
      moduleId,
      userId,
    });

    //then
    expect(result).lengthOf(2);
    expect(result[0]).instanceOf(CombinedCourse);
    expect(result[1]).instanceOf(CombinedCourse);
    expect(result).deep.members([
      {
        id: combinedCourse1.id,
        code: combinedCourse1.code,
        organizationId: combinedCourse1.organizationId,
        name: combinedCourse1.name,
        description: combinedCourse1.description,
        illustration: combinedCourse1.illustration,
        participations: [],
        questId: combinedCourse1.questId,
        blueprintId: combinedCourse1.combinedCourseBlueprintId,
        deletedAt: null,
        deletedBy: null,
        baseSurveyUrl: null,
      },
      {
        id: combinedCourse2.id,
        code: combinedCourse2.code,
        organizationId: combinedCourse2.organizationId,
        name: combinedCourse2.name,
        description: combinedCourse2.description,
        illustration: combinedCourse2.illustration,
        participations: [],
        questId: combinedCourse2.questId,
        blueprintId: combinedCourse2.combinedCourseBlueprintId,
        deletedAt: null,
        deletedBy: null,
        baseSurveyUrl: null,
      },
    ]);
  });

  it('should return an empty array if no quest match', async function () {
    //given
    const learner = databaseBuilder.factory.buildOrganizationLearner();
    const moduleId = 'module-abc';
    await databaseBuilder.commit();

    //when
    const result = await usecases.findCombinedCourseByModuleIdAndUserId({
      moduleId,
      userId: learner.userId,
    });

    // then
    expect(result).deep.equal([]);
  });
});
