import { expect } from 'chai';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import {
  CappedTubeNotProvidedError,
  CappedTubeRequirementsMissingError,
  CappedTubeRequirementWithoutTargetProfilesError,
} from '../../../../../src/quest/domain/errors.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CappedTube } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CappedTube.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { QuestInput } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/QuestInput.js';
import { Quest, REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
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

    it('should keep the quest if one is passed instead of rebuilding one', function () {
      // given
      const persistedQuest = new QuestInput({
        items: [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 42 }],
        rewardId: 5,
        rewardType: REWARD_TYPES.ATTESTATION,
        cappedTubeRequirements: [{ tubes: [{ tubeId: 'tubeId1', level: 4 }], threshold: 75, name: 'grp' }],
      }).toQuest();

      // when
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        content: [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 42 }],
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        quest: persistedQuest,
      });

      // then
      expect(combinedCourseBlueprintForCreation.quest).to.equal(persistedQuest);
      expect(combinedCourseBlueprintForCreation.quest.rewardId).to.equal(5);
      expect(combinedCourseBlueprintForCreation.quest.hasCappedTubeRequirements).to.be.true;
    });

    ['name', 'internalName', 'description', 'prescriberDescription'].forEach((requiredAttribute) => {
      describe(`when ${requiredAttribute} is not provided`, function () {
        it('should throw a validation error', function () {
          // given
          values[requiredAttribute] = null;

          // when
          const error = catchErrSync(() => new CombinedCourseBlueprintForCreation(values))();

          // then
          expect(error).to.be.an.instanceOf(EntityValidationError);
        });
      });
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
        description: 'description',
        prescriberDescription: 'prescriberDescription',
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
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        cappedTubeRequirements: [{ tubes: [{ tubeId: 'tubeId1', level: 1 }], threshold: 50, name: 'name' }],
        content: [{ type: 'module', value: 'moduleId-1' }],
      });
      const err = catchErrSync(() => combinedCourseBlueprintForCreation.toCombinedCourseBlueprint())();

      expect(err).to.be.an.instanceOf(CappedTubeRequirementWithoutTargetProfilesError);
      expect(err.code).to.equal('CAPPED_TUBE_REQUIREMENTS_WITHOUT_TARGET_PROFILE');
    });
    it('should throw if capped tubes requirements are missing but a threshold is defined', function () {
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        cappedTubeRequirements: [],
        schemaThreshold: 0.5,
        content: [{ type: 'campaign', value: 1 }],
      });
      const err = catchErrSync(() => combinedCourseBlueprintForCreation.toCombinedCourseBlueprint())();

      expect(err).to.be.an.instanceOf(CappedTubeRequirementsMissingError);
      expect(err.code).to.equal('CAPPED_TUBE_REQUIREMENTS_MISSING');
    });
  });
  describe('#validate', function () {
    it('should throw a validation error if content is not provided', function () {
      // given
      delete values.content;

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprintForCreation(values))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('should throw a validation error if both a schema threshold and capped tube requirements are provided', function () {
      // given
      values.schemaThreshold = 20;
      values.cappedTubeRequirements = [{ tubes: [{ tubeId: 'tubeId1', level: 1 }], threshold: 50, name: 'name' }];

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprintForCreation(values))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.code).to.equal('CAPPED_TUBE_REQUIREMENTS_SCHEMA_THRESHOLD_MISMATCH');
    });
  });

  describe('#needsCappedTubesFromTargetProfiles', function () {
    it('should be true when a schema threshold is defined without capped tube requirements', function () {
      // given
      values.schemaThreshold = 20;
      values.cappedTubeRequirements = [];

      // when
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(combinedCourseBlueprintForCreation.needsCappedTubesFromTargetProfiles).to.equal(true);
    });

    it('should be false when capped tube requirements are already defined', function () {
      // given
      delete values.schemaThreshold;
      values.content = [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 1 }];
      values.cappedTubeRequirements = [{ tubes: [{ tubeId: 'tubeId1', level: 1 }], threshold: 50, name: 'name' }];

      // when
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(combinedCourseBlueprintForCreation.needsCappedTubesFromTargetProfiles).to.equal(false);
    });

    it('should be false when no schema threshold is defined', function () {
      // given
      delete values.schemaThreshold;
      values.cappedTubeRequirements = [];

      // when
      const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation(values);

      // then
      expect(combinedCourseBlueprintForCreation.needsCappedTubesFromTargetProfiles).to.equal(false);
    });
  });

  describe('#setCappedTubes', function () {
    let combinedCourseBlueprintForCreation;

    beforeEach(function () {
      combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        content: [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 1 }],
        schemaThreshold: 20,
      });
    });

    it('should throw a domain error if no capped tube is provided', function () {
      // when
      const error = catchErrSync(() => combinedCourseBlueprintForCreation.setCappedTubes([]))();

      // then
      expect(error).to.be.an.instanceOf(CappedTubeNotProvidedError);
      expect(error.message).to.equal('Provided cappedTubes are empty');
    });

    it('should build a single capped tube requirement using the schema threshold', function () {
      // given
      const cappedTubes = [new CappedTube({ id: 'tubeId1', level: 3 })];

      // when
      combinedCourseBlueprintForCreation.setCappedTubes(cappedTubes);

      // then
      const cappedTubeRequirements = combinedCourseBlueprintForCreation.quest.successRequirements.filter(
        ({ requirement_type }) => requirement_type === REQUIREMENT_TYPES.CAPPED_TUBES,
      );
      expect(cappedTubeRequirements).to.be.lengthOf(1);
      expect(cappedTubeRequirements[0].data).to.deep.include({
        threshold: 20,
        cappedTubes: [{ tubeId: 'tubeId1', level: 3 }],
      });
    });

    it('should keep a single entry per tube with its highest level', function () {
      // given
      const cappedTubes = [
        new CappedTube({ id: 'tubeId1', level: 3 }),
        new CappedTube({ id: 'tubeId2', level: 8 }),
        new CappedTube({ id: 'tubeId1', level: 6 }),
      ];

      // when
      combinedCourseBlueprintForCreation.setCappedTubes(cappedTubes);

      // then
      const [cappedTubeRequirement] = combinedCourseBlueprintForCreation.quest.successRequirements.filter(
        ({ requirement_type }) => requirement_type === REQUIREMENT_TYPES.CAPPED_TUBES,
      );
      expect(cappedTubeRequirement.data.cappedTubes).to.deep.equal([
        { tubeId: 'tubeId1', level: 6 },
        { tubeId: 'tubeId2', level: 8 },
      ]);
    });

    it('should keep the reward and the content of the rebuilt quest', function () {
      // given
      combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        prescriberDescription: 'prescriberDescription',
        content: [{ type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 12 }],
        rewardId: 5,
        rewardType: 'ATTESTATION',
        schemaThreshold: 20,
      });

      // when
      combinedCourseBlueprintForCreation.setCappedTubes([new CappedTube({ id: 'tubeId1', level: 3 })]);

      // then
      expect(combinedCourseBlueprintForCreation.quest.rewardId).to.equal(5);
      expect(combinedCourseBlueprintForCreation.quest.rewardType).to.equal(REWARD_TYPES.ATTESTATION);
      expect(combinedCourseBlueprintForCreation.quest.hasCappedTubeRequirements).to.be.true;
      expect(combinedCourseBlueprintForCreation.targetProfileIds).to.deep.equal([12]);
    });
  });
});
