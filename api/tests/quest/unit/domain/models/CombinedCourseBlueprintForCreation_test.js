import { expect } from 'chai';

import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprintForCreation ', function () {
  let values;

  beforeEach(function () {
    const quest = domainBuilder.buildQuest();

    values = {
      name: 'name',
      internalName: 'internalName',
      description: 'description',
      prescriberDescription: 'prescriberDescription',
      illustration: 'http://example.pix/illustration',
      surveyLink: 'http://example.pix/survey-link',
      rewardRequirementsDescription: 'description of the reward requirements',
      quest,
    };
  });

  describe('#constructor', function () {
    it('should construct object', function () {
      //given

      // when
      const blueprint = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(blueprint).deep.equal(values);
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

      values.quest = new QuestInput({ items }).toQuest();

      // when
      const blueprint = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(blueprint.targetProfileIds).to.deep.equal([12, 34]);
    });
  });
});
