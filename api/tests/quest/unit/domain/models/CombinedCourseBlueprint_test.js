import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-course/CombinedCourse.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprint ', function () {
  describe('#constructor', function () {
    it('should construct object', function () {
      // given
      const values = {
        id: 1,
        name: 'name',
        internalName: 'internalName',
        description: 'description',
        illustration: 'illustration',
        surveyLink: 'survey-link-test',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-26'),
        organizationIds: [],
        quest: null,
      };

      // when
      const blueprint = new CombinedCourseBlueprint(values);

      // then
      expect(blueprint).deep.equal(values);
    });
  });

  describe('#moduleIds', function () {
    it('should return module ids from passages success requirements', async function () {
      const firstTargetProfileId = 1;

      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'moduleId-555' }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'moduleId-777' }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
        ],
      });

      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        quest,
      });
      expect(combinedCourseBlueprint.moduleIds).to.deep.equal(['moduleId-555', 'moduleId-777']);
    });

    it('should return empty list of ids if template has no passages success requirements', async function () {
      const firstTargetProfileId = 1;

      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: firstTargetProfileId }),
        ],
      });

      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        quest,
      });
      expect(combinedCourseBlueprint.moduleIds).to.deep.equal([]);
    });
  });

  describe('#getTargetProfileIds', function () {
    it('should return target profile ids from campaignParticipations success requirements', async function () {
      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 1 }),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: 8 }),
        ],
      });

      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        quest,
      });
      expect(combinedCourseBlueprint.targetProfileIds).to.deep.equal([1, 8]);
    });

    it('should return empty list of ids if template has not any campaignParticipations success requirements', async function () {
      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
          }),
        ],
      });

      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        quest,
      });
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
      const name = 'Combinix';
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

      const description = 'bla bla bla';
      const illustration = 'illu.svg';
      const rewardId = 1;
      const rewardType = REWARD_TYPES.ATTESTATION;

      const combinedCourseBlueprintQuest = new Quest({
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
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name,
        description,
        illustration,
        quest: combinedCourseBlueprintQuest,
      });
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
      expect(combinedCourse.name).to.equal(name);
      expect(combinedCourse.description).to.equal(description);
      expect(combinedCourse.illustration).to.equal(illustration);
      expect(combinedCourse.code).to.equal(code);
      expect(combinedCourse.organizationId).to.equal(organizationId);
    });
  });

  describe('#detachOrganization', function () {
    it('should retrieve organization id from model instance', async function () {
      //given
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'Blueprint1',
        content: [],
        description: '',
        illustration: '',
        organizationIds: [1],
      });

      //when
      combinedCourseBlueprint.detachOrganization({ organizationId: 1 });

      //then
      expect(combinedCourseBlueprint.organizationIds).empty;
    });
  });

  describe('#attachOrganizations', function () {
    it('should add organization ids to the model instance', async function () {
      //given
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'Blueprint1',
        content: [],
        description: '',
        illustration: '',
        organizationIds: [1],
      });

      //when
      combinedCourseBlueprint.attachOrganizations({ organizationIds: [2, 3] });

      //then
      expect(combinedCourseBlueprint.organizationIds).to.deep.equal([1, 2, 3]);
    });

    it('should return attached organization ids and duplicated ids', async function () {
      //given
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'Blueprint1',
        content: [],
        description: '',
        illustration: '',
        organizationIds: [1],
      });

      //when
      const { attachedOrganizationIds, duplicatedOrganizationIds } = combinedCourseBlueprint.attachOrganizations({
        organizationIds: [1, 2, 3],
      });

      //then
      expect(attachedOrganizationIds).to.deep.equal([2, 3]);
      expect(duplicatedOrganizationIds).to.deep.equal([1]);
    });
  });
});
