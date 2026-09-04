import { expect } from 'chai';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { Quest } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { DomainError, EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprintForCreation ', function () {
  let values;

  beforeEach(function () {
    values = {
      name: 'name',
      internalName: 'internalName',
      description: 'description',
      prescriberDescription: 'prescriberDescription',
      illustration: 'http://example.pix/illustration',
      surveyLink: 'http://example.pix/survey-link',
      rewardRequirementsDescription: 'description of the reward requirements',
      schemaThreshold: 0.5,
      content: [{ type: 'module', value: 'moduleId-1' }],
      rewardType: 'ATTESTATION',
      rewardId: 1,
      cappedTubeRequirements: [],
    };
  });

  describe('#constructor', function () {
    it('should construct object', function () {
      //given

      // when
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(combinedCourseBlueprintForCreation).to.deep.include({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        illustration: 'http://example.pix/illustration',
        surveyLink: 'http://example.pix/survey-link',
        rewardRequirementsDescription: 'description of the reward requirements',
        schemaThreshold: 0.5,
        content: [{ type: 'module', value: 'moduleId-1' }],
        cappedTubeRequirements: [],
      });
      expect(combinedCourseBlueprintForCreation.quest.eligibilityRequirements).to.be.lengthOf(0);
      expect(combinedCourseBlueprintForCreation.quest.successRequirements).to.be.lengthOf(1);
      expect(combinedCourseBlueprintForCreation.quest.rewardId).to.equal(1);
      expect(combinedCourseBlueprintForCreation.quest.rewardType).to.be.equal(REWARD_TYPES.ATTESTATION);
      expect(combinedCourseBlueprintForCreation.quest).to.be.an.instanceOf(Quest);
    });

    it('should throw a validation error if a required field is not provided', function () {
      // given
      values.name = null;

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprintForCreation(values))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });

  describe('#targetProfileIds', function () {
    it('should return target profile ids from quest success requirements', function () {
      // given
      const items = [
        { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 12 },
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: '6282925d-4775-4bca-b513-4c3009ec5886' },
        { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 34 },
      ];

      // when
      const blueprint = new CombinedCourseBlueprintForCreation({
        content: items,
        name: 'name',
        internalName: 'internalName',
      });

      // then
      expect(blueprint.targetProfileIds).to.deep.equal([12, 34]);
    });
  });

  describe('toCombinedCourseBlueprint', function () {
    it('should return a new combined course blueprint if the entry data is valid', function () {
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        illustration: 'http://example.pix/illustration.png',
        rewardRequirementsDescription: 'rewardRequirementsDescription',
        surveyLink: 'http://example.pix/survey',
        cappedTubeRequirements: [{ tubes: [{ tubeId: 'tubeId1', level: 1 }], threshold: 50, name: 'name' }],
        content: [{ type: 'campaign', value: 1 }],
      });

      const combinedCourseBlueprint = combinedCourseBlueprintForCreation.toCombinedCourseBlueprint();

      expect(combinedCourseBlueprint).to.be.an.instanceOf(CombinedCourseBlueprint);
      expect(combinedCourseBlueprint).to.deep.include({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        illustration: 'http://example.pix/illustration.png',
        surveyLink: 'http://example.pix/survey',
        rewardRequirementsDescription: 'rewardRequirementsDescription',
      });
    });
    it('should throw if capped tubes requirements are defined without target profiles in content', function () {
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        cappedTubeRequirements: [{ tubes: [{ tubeId: 'tubeId1', level: 1 }], threshold: 50, name: 'name' }],
        content: [{ type: 'module', value: 'moduleId-1' }],
      });
      const err = catchErrSync(() => combinedCourseBlueprintForCreation.toCombinedCourseBlueprint())();

      expect(err).to.be.an.instanceOf(DomainError);
      expect(err.code).to.equal('CAPPED_TUBE_REQUIREMENTS_WITHOUT_TARGET_PROFILE');
    });
    it('should throw if capped tubes requirements are missing but a threshold is defined', function () {
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        cappedTubeRequirements: [],
        schemaThreshold: 0.5,
        content: [{ type: 'campaign', value: 1 }],
      });
      const err = catchErrSync(() => combinedCourseBlueprintForCreation.toCombinedCourseBlueprint())();

      expect(err).to.be.an.instanceOf(DomainError);
      expect(err.code).to.equal('CAPPED_TUBE_REQUIREMENTS_MISSING');
    });
  });
});
