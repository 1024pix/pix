import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprintDetails } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | AdminCombinedCourseBlueprintDetails ', function () {
  describe('#constructor', function () {
    it('should set content alongside inherited properties', function () {
      const items = [{ type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 12 }];
      const quest = new QuestInput({ items }).toQuest();
      const content = [{ type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 12 }];

      const details = new AdminCombinedCourseBlueprintDetails({ quest, content });

      expect(details.content).to.deep.equal(content);
      expect(details.quest).to.equal(quest);
    });
  });

  describe('.buildFromBlueprint', function () {
    it('should build details with content derived from quest', function () {
      const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
      const shortId = 'abc123';
      const targetProfileId = 42;
      const items = [
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: targetProfileId },
      ];
      const quest = new QuestInput({ items }).toQuest();
      const combinedCourseBlueprint = { id: 1, name: 'test', quest };
      const modulesById = { [moduleId]: [{ shortId }] };

      const details = AdminCombinedCourseBlueprintDetails.buildFromBlueprint({
        combinedCourseBlueprint,
        modulesById,
        attestationLabel: 'Mon attestation',
      });

      expect(details).to.be.instanceOf(AdminCombinedCourseBlueprintDetails);
      expect(details.attestationLabel).to.equal('Mon attestation');
      expect(details.content).to.deep.equal([
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId, shortId },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: targetProfileId },
      ]);
    });
  });
});
