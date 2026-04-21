import { ATTESTATIONS } from '../../../../../src/profile/domain/constants.js';
import {
  ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS,
  AdminCombinedCourseBlueprint,
} from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprint.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Domain | Models | AdminCombinedCourseBlueprint ', function () {
  describe('#constructor', function () {
    it('should construct object', function () {
      // given
      const values = {
        id: 1,
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        illustration: 'illustration',
        content: AdminCombinedCourseBlueprint.buildContentItems([{ moduleShortId: '123' }]),
        attestationKey: ATTESTATIONS.PARENTHOOD,
        attestationLabel: 'Parentalité',
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationIds: [],
      };
      // when
      const blueprint = new AdminCombinedCourseBlueprint(values);

      // then
      expect(blueprint).deep.equal(values);
    });
  });

  describe('#buildContentItems', function () {
    it('should build blueprint content items for targetProfileId and moduleId', function () {
      const requirements = AdminCombinedCourseBlueprint.buildContentItems([
        { targetProfileId: 123 },
        { moduleShortId: 'az-123' },
      ]);

      expect(requirements).deep.equal([
        {
          type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 123,
        },
        {
          type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'az-123',
        },
      ]);
    });
  });

  describe('#buildFromBlueprint', function () {
    it('should return an object containing combined course blueprint, content and attestation key', function () {
      // given
      const combinedCourseBlueprint = domainBuilder.buildCombinedCourseBlueprint({
        quest: domainBuilder.buildQuest({
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 123 }),
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'completeId-az-123' }),
          ],
        }),
      });

      const expectedContent = AdminCombinedCourseBlueprint.buildContentItems([
        { targetProfileId: 123 },
        { moduleShortId: 'az-123' },
      ]);

      // when
      const readyToSerialize = AdminCombinedCourseBlueprint.buildFromBlueprint({
        combinedCourseBlueprint,
        modulesById: { 'completeId-az-123': [{ shortId: 'az-123' }] },
        attestationLabel: 'Parentalité',
      });

      // then
      expect(readyToSerialize).deep.equal(
        new AdminCombinedCourseBlueprint({
          ...combinedCourseBlueprint,
          content: expectedContent,
          attestationLabel: 'Parentalité',
        }),
      );
    });
  });
});
