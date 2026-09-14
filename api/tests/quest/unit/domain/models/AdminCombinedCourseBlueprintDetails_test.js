import { expect } from 'chai';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprintDetails } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Domain | Models | AdminCombinedCourseBlueprintDetails ', function () {
  describe('#constructor', function () {
    it('should set content alongside inherited properties', function () {
      const rewardRequirements = [{ threshold: 50, areas: [domainBuilder.buildArea()] }];
      const content = [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 12 }];
      const name = 'external name';
      const internalName = 'internal name';
      const description = 'description';
      const prescriberDescription = 'prescriber description';

      const details = new AdminCombinedCourseBlueprintDetails({
        rewardRequirements,
        content,
        name,
        internalName,
        description,
        prescriberDescription,
      });

      expect(details.content).to.deep.equal(content);
      expect(details.rewardRequirements).to.equal(rewardRequirements);
      expect(details.targetProfileIds).to.deep.equal([12]);
    });
  });

  describe('.buildFromBlueprint', function () {
    it('should build details with content derived from quest', function () {
      // given
      const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
      const shortId = 'abc123';
      const targetProfileId = 42;
      const items = [
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId },
        { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: targetProfileId },
      ];
      const quest = new QuestInput({ items }).toQuest();
      const combinedCourseBlueprint = {
        id: 1,
        name: 'test',
        internalName: 'internal',
        description: 'description',
        prescriberDescription: 'prescriber description',
        quest,
      };
      const modulesById = { [moduleId]: [{ shortId }] };
      const area1 = domainBuilder.buildArea();
      const area2 = domainBuilder.buildArea();

      // when
      const details = AdminCombinedCourseBlueprintDetails.buildFromBlueprint({
        combinedCourseBlueprint,
        modulesById,
        rewardRequirements: [
          { threshold: 50, areas: [area1] },
          { threshold: 70, areas: [area2] },
        ],
        attestationLabel: 'Mon attestation',
      });

      // then
      expect(details).to.be.instanceOf(AdminCombinedCourseBlueprintDetails);
      expect(details.attestationLabel).to.equal('Mon attestation');
      expect(details.content).to.deep.equal([
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId, shortId },
        { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: targetProfileId },
      ]);
      expect(details.rewardRequirements).to.be.lengthOf(2);
    });
    it('should preserve the reward and the capped tube requirements of the persisted quest', function () {
      // given
      const targetProfileId = 42;
      const quest = new QuestInput({
        items: [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: targetProfileId }],
        rewardId: 5,
        rewardType: REWARD_TYPES.ATTESTATION,
        cappedTubeRequirements: [{ tubes: [{ tubeId: 'tubeId1', level: 4 }], threshold: 75, name: 'grp' }],
      }).toQuest();
      const combinedCourseBlueprint = {
        id: 1,
        name: 'test',
        internalName: 'internal',
        description: 'description',
        prescriberDescription: 'prescriber description',
        quest,
      };

      // when
      const details = AdminCombinedCourseBlueprintDetails.buildFromBlueprint({
        combinedCourseBlueprint,
        modulesById: {},
        attestationLabel: 'Mon attestation',
      });

      // then
      expect(details.quest).to.equal(quest);
      expect(details.quest.rewardId).to.equal(5);
      expect(details.quest.rewardType).to.equal(REWARD_TYPES.ATTESTATION);
      expect(details.quest.hasCappedTubeRequirements).to.be.true;
      expect(details.targetProfileIds).to.deep.equal([targetProfileId]);
    });
  });
});
