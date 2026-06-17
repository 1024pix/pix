import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { Quest } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import * as combinedCourseBlueprintForCreationSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-for-creation-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | admin-combined-course-blueprint', function () {
  it('#deserialize', async function () {
    const date = new Date();
    const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
    const items = [
      { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId },
      { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 123 },
    ];
    // given
    const serializedBlueprint = {
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'reward-id': 5,
          'reward-type': 'ATTESTATION',
          content: items,
          'created-at': date,
          'updated-at': date,
          'survey-link': 'http://survey',
        },
        type: 'combined-course-blueprints',
        id: '1',
      },
    };

    // when
    const result = await combinedCourseBlueprintForCreationSerializer.deserialize(serializedBlueprint);

    // then
    expect(result).to.deep.equal(
      new CombinedCourseBlueprintForCreation({
        id: '1',
        name: 'Mon parcours',
        internalName: 'Mon modèle de parcours',
        illustration: '/illustrations/image.svg',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        rewardId: 5,
        rewardType: 'ATTESTATION',
        createdAt: date,
        updatedAt: date,
        quest: new Quest({
          eligibilityRequirements: [],
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }),
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 123 }),
          ],
          rewardId: 5,
          rewardType: REWARD_TYPES.ATTESTATION,
        }),
        surveyLink: 'http://survey',
      }),
    );
  });
});
