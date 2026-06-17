import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | QuestInput', function () {
  describe('#constructor', function () {
    it('should throw if an item has an invalid type', function () {
      expect(() => new QuestInput({ items: [{ type: 'invalid', value: 'x' }] })).to.throw(EntityValidationError);
    });

    it('should throw if an evaluation item has a non-integer value', function () {
      expect(() => new QuestInput({ items: [{ type: 'evaluation', value: 'not-an-int' }] })).to.throw(
        EntityValidationError,
      );
    });
  });

  describe('#toQuest', function () {
    it('should build a quest from a module item', function () {
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const questInput = new QuestInput({ items: [{ type: 'module', value: moduleId }] });

      const quest = questInput.toQuest();

      expect(quest).to.be.instanceOf(Quest);
      expect(quest.eligibilityRequirements).to.deep.equal([]);
      expect(quest.successRequirements.map((r) => r.toDTO())).to.deep.equal([
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            moduleId: { data: moduleId, comparison: CRITERION_COMPARISONS.EQUAL },
            isTerminated: { data: true, comparison: CRITERION_COMPARISONS.EQUAL },
          },
        },
      ]);
    });

    it('should build a quest from an evaluation item', function () {
      const targetProfileId = 42;
      const questInput = new QuestInput({ items: [{ type: 'evaluation', value: targetProfileId }] });

      const quest = questInput.toQuest();

      expect(quest).to.be.instanceOf(Quest);
      expect(quest.eligibilityRequirements).to.deep.equal([]);
      expect(quest.successRequirements.map((r) => r.toDTO())).to.deep.equal([
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            targetProfileId: { data: targetProfileId, comparison: CRITERION_COMPARISONS.EQUAL },
            status: { data: CampaignParticipationStatuses.SHARED, comparison: CRITERION_COMPARISONS.EQUAL },
          },
        },
      ]);
    });

    it('should build a quest from mixed items', function () {
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const targetProfileId = 42;
      const questInput = new QuestInput({
        items: [
          { type: 'module', value: moduleId },
          { type: 'evaluation', value: targetProfileId },
        ],
      });

      const quest = questInput.toQuest();

      expect(quest.successRequirements.map((r) => r.toDTO())).to.deep.equal([
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            moduleId: { data: moduleId, comparison: CRITERION_COMPARISONS.EQUAL },
            isTerminated: { data: true, comparison: CRITERION_COMPARISONS.EQUAL },
          },
        },
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            targetProfileId: { data: targetProfileId, comparison: CRITERION_COMPARISONS.EQUAL },
            status: { data: CampaignParticipationStatuses.SHARED, comparison: CRITERION_COMPARISONS.EQUAL },
          },
        },
      ]);
    });

    it('should include rewardId and rewardType in the quest', function () {
      const questInput = new QuestInput({ items: [], rewardId: 7, rewardType: REWARD_TYPES.ATTESTATION });

      const quest = questInput.toQuest();

      expect(quest.rewardId).to.equal(7);
      expect(quest.rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });

    it('should build a quest without reward', function () {
      const questInput = new QuestInput({ items: [] });

      const quest = questInput.toQuest();

      expect(quest.rewardId).to.be.undefined;
      expect(quest.rewardType).to.be.undefined;
    });
  });

  describe('#itemsFromQuest', function () {
    it('should rebuild items from a quest with mixed requirements', function () {
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const shortId = 'az-123';
      const targetProfileId = 42;
      const quest = new QuestInput({
        items: [
          { type: 'module', value: moduleId, shortId },
          { type: 'evaluation', value: targetProfileId },
        ],
      }).toQuest();
      const modulesById = { [moduleId]: [{ shortId }] };

      const items = QuestInput.itemsFromQuest({ quest, modulesById });

      expect(items).to.deep.equal([
        { type: 'module', value: moduleId, shortId },
        { type: 'evaluation', value: targetProfileId },
      ]);
    });

    it('should produce items that round-trip through buildContentItems', function () {
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const shortId = 'az-123';
      const targetProfileId = 42;
      const originalContent = [
        { type: 'module', value: moduleId, shortId },
        { type: 'evaluation', value: targetProfileId },
      ];
      const quest = new QuestInput({ items: originalContent }).toQuest();
      const modulesById = { [moduleId]: [{ shortId }] };

      const rebuiltContent = QuestInput.itemsFromQuest({ quest, modulesById });

      expect(rebuiltContent).to.deep.equal(originalContent);
    });
  });
});
