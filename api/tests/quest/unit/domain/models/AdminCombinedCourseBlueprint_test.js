import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprint } from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprint.js';
import { QuestInput } from '../../../../../src/quest/domain/models/QuestInput.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Domain | Models | AdminCombinedCourseBlueprint ', function () {
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
      const blueprint = new AdminCombinedCourseBlueprint(values);

      // then
      expect(blueprint).deep.equal(values);
    });

    it('should throw if quest is not provided', function () {
      const error = catchErrSync(() => new AdminCombinedCourseBlueprint({ name: 'test' }))();

      expect(error).to.be.an.instanceOf(ObjectValidationError);
      expect(error.message).to.equal('Quest is required');
    });
  });

  describe('#targetProfileIds', function () {
    it('should return target profile ids from quest success requirements', function () {
      const items = [
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 12 },
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: '6282925d-4775-4bca-b513-4c3009ec5886' },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 34 },
      ];
      const blueprint = new AdminCombinedCourseBlueprint({
        quest: new QuestInput({ items }).toQuest(),
      });

      expect(blueprint.targetProfileIds).to.deep.equal([12, 34]);
    });
  });
});
