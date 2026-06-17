import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprintForCreation ', function () {
  describe('#constructor', function () {
    it('should construct object', function () {
      const quest = domainBuilder.buildQuest();
      // given
      const values = {
        id: 1,
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        illustration: 'illustration',
        attestationLabel: 'Parentalité',
        rewardId: 1,
        rewardType: 'attestations',
        surveyLink: 'survey-link-test',
        quest,
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationIds: [],
      };
      // when
      const blueprint = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(blueprint).deep.equal(values);
    });
  });

  describe('#targetProfileIds', function () {
    it('should return target profile ids from quest success requirements', function () {
      const items = [
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 12 },
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: '6282925d-4775-4bca-b513-4c3009ec5886' },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 34 },
      ];
      const blueprint = new CombinedCourseBlueprintForCreation({
        quest: new QuestInput({ items }).toQuest(),
      });

      expect(blueprint.targetProfileIds).to.deep.equal([12, 34]);
    });
  });
});
