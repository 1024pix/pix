import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-course/CombinedCourse.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForUpdate } from '../../../../../src/quest/domain/models/CombinedCourseBlueprintForUpdate.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprint ', function () {
  let values;

  beforeEach(function () {
    const quest = new Quest({
      eligibilityRequirements: [],
      successRequirements: [],
    });
    values = {
      id: 1,
      name: 'name',
      internalName: 'internalName',
      description: 'description',
      illustration: 'illustration',
      surveyLink: 'survey-link-test',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-26'),
      organizationIds: [],
      quest,
    };
  });

  describe('#constructor', function () {
    it('should construct object', function () {
      // when
      const blueprint = new CombinedCourseBlueprint(values);

      // then
      expect(blueprint).deep.equal(values);
    });

    it('should throw if quest is not provided', function () {
      // given
      values.quest = null;

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprint(values))();

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
      expect(error.message).to.equal('Quest is required');
    });

    it('should throw if name is not provided', function () {
      // given
      values.name = null;

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprint(values))();

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
      expect(error.message).to.equal('Name is required');
    });

    it('should throw if internalName is not provided', function () {
      // given
      values.internalName = null;

      // when
      const error = catchErrSync(() => new CombinedCourseBlueprint(values))();

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
      expect(error.message).to.equal('InternalName is required');
    });
  });

  describe('#moduleIds', function () {
    it('should return module ids from passages success requirements', async function () {
      // given
      const firstTargetProfileId = 1;

      values.quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'moduleId-555' }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'moduleId-777' }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
        ],
      });

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      // then
      expect(combinedCourseBlueprint.moduleIds).to.deep.equal(['moduleId-555', 'moduleId-777']);
    });

    it('should return empty list of ids if template has no passages success requirements', async function () {
      // given
      const firstTargetProfileId = 1;

      values.quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
        ],
      });

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      // then
      expect(combinedCourseBlueprint.moduleIds).to.deep.equal([]);
    });
  });

  describe('#getTargetProfileIds', function () {
    it('should return target profile ids from campaignParticipations success requirements', async function () {
      // given
      values.quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 1 }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 8 }),
        ],
      });

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      // then
      expect(combinedCourseBlueprint.targetProfileIds).to.deep.equal([1, 8]);
    });

    it('should return empty list of ids if template has not any campaignParticipations success requirements', async function () {
      // given
      values.quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
          }),
        ],
      });

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      // then
      expect(combinedCourseBlueprint.targetProfileIds).to.deep.equal([]);
    });
  });

  describe('#toCombinedCourse', function () {
    it('should create combined course from blueprint and given organization data ', async function () {
      // given
      const organizationId = 1;
      const firstCampaignId = 1001;
      const secondCampaignId = 1002;
      const firstTargetProfileId = 1;
      const secondTargetProfileId = 2;
      values.name = 'Combinix';
      const code = 'COMBINIX1';
      const campaigns = [
        {
          id: firstCampaignId,
          targetProfileId: firstTargetProfileId,
        },
        {
          id: secondCampaignId,
          targetProfileId: secondTargetProfileId,
        },
      ];
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';

      values.description = 'bla bla bla';
      values.illustration = 'illu.svg';
      const rewardId = 1;
      const rewardType = REWARD_TYPES.ATTESTATION;

      values.quest = new Quest({
        rewardId,
        rewardType,
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: secondTargetProfileId }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }),
        ],
      });

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);
      const combinedCourse = combinedCourseBlueprint.toCombinedCourse({
        code,
        organizationId,
        campaigns,
      });

      // then
      const expectedQuest = new Quest({
        rewardId,
        rewardType,
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: secondTargetProfileId }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }),
        ],
      });

      expect(combinedCourse).to.be.instanceOf(CombinedCourse);
      expect(combinedCourse.quest.successRequirements).to.deep.equal(expectedQuest.successRequirements);
      expect(combinedCourse.name).to.equal(values.name);
      expect(combinedCourse.description).to.equal(values.description);
      expect(combinedCourse.illustration).to.equal(values.illustration);
      expect(combinedCourse.code).to.equal(code);
      expect(combinedCourse.organizationId).to.equal(organizationId);
    });
  });

  describe('#detachOrganization', function () {
    it('should retrieve organization id from model instance', async function () {
      //given
      values.organizationIds = [1];
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      //when
      combinedCourseBlueprint.detachOrganization({ organizationId: 1 });

      //then
      expect(combinedCourseBlueprint.organizationIds).empty;
    });
  });

  describe('#attachOrganizations', function () {
    it('should add organization ids to the model instance', async function () {
      //given
      values.organizationIds = [1];
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      //when
      combinedCourseBlueprint.attachOrganizations({ organizationIds: [2, 3] });

      //then
      expect(combinedCourseBlueprint.organizationIds).to.deep.equal([1, 2, 3]);
    });

    it('should return attached organization ids and duplicated ids', async function () {
      //given
      values.organizationIds = [1];
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      //when
      const { attachedOrganizationIds, duplicatedOrganizationIds } = combinedCourseBlueprint.attachOrganizations({
        organizationIds: [1, 2, 3],
      });

      //then
      expect(attachedOrganizationIds).to.deep.equal([2, 3]);
      expect(duplicatedOrganizationIds).to.deep.equal([1]);
    });
  });

  describe('#update', function () {
    it('should update with the modified data', async function () {
      //given
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      const combinedCourseBlueprintForUpdate = new CombinedCourseBlueprintForUpdate({
        name: 'NewName',
        internalName: 'NewInternalName',
        description: 'NewDescription',
        illustration: 'NewIllustration',
        surveyLink: values.surveyLink,
      });

      const expectedUpdatedBlueprint = new CombinedCourseBlueprint({
        id: values.id,
        name: 'NewName',
        internalName: 'NewInternalName',
        description: 'NewDescription',
        illustration: 'NewIllustration',
        surveyLink: values.surveyLink,
        organizationIds: values.organizationIds,
        quest: values.quest,
        updatedAt: values.updatedAt,
        createdAt: values.createdAt,
      });

      //when
      combinedCourseBlueprint.update({ combinedCourseBlueprintForUpdate });

      //then
      expect(combinedCourseBlueprint).to.deep.equal(expectedUpdatedBlueprint);
    });

    it('should reset data when not defined in update', async function () {
      //given
      const combinedCourseBlueprint = new CombinedCourseBlueprint(values);

      const combinedCourseBlueprintForUpdate = new CombinedCourseBlueprintForUpdate({
        name: 'NewName',
        internalName: 'NewInternalName',
      });

      const expectedUpdatedBlueprint = new CombinedCourseBlueprint({
        id: values.id,
        name: 'NewName',
        internalName: 'NewInternalName',
        description: null,
        illustration: null,
        surveyLink: null,
        organizationIds: values.organizationIds,
        quest: values.quest,
        updatedAt: values.updatedAt,
        createdAt: values.createdAt,
      });

      //when
      combinedCourseBlueprint.update({ combinedCourseBlueprintForUpdate });

      //then
      expect(combinedCourseBlueprint).to.deep.equal(expectedUpdatedBlueprint);
    });
  });
});
