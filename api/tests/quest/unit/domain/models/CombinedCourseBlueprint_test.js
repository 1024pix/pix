import { CombinedCourse } from '../../../../../src/quest/domain/models/CombinedCourse.js';
import {
  COMBINED_COURSE_BLUEPRINT_ITEMS,
  CombinedCourseBlueprint,
} from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { Module } from '../../../../../src/quest/domain/models/Module.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseBlueprint ', function () {
  describe('#constructor', function () {
    it('should construct object', function () {
      // given
      const values = {
        id: 1,
        name: 'name',
        internalName: 'internaleName',
        description: 'description',
        illustration: 'illustration',
        content: CombinedCourseBlueprint.buildContentItems([{ moduleShortId: '123' }]),
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-26'),
        organizationIds: [],
        questId: 1,
      };
      // when
      const blueprint = new CombinedCourseBlueprint(values);

      // then
      expect(blueprint).deep.equal(values);
    });
  });
  describe('#buildContentItems', function () {
    it('should build blueprint content items for targetProfileId and moduleId', function () {
      const requirements = CombinedCourseBlueprint.buildContentItems([
        { targetProfileId: 123 },
        { moduleShortId: 'az-123' },
      ]);

      expect(requirements).deep.equal([
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 123,
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'az-123',
        },
      ]);
    });
  });

  describe('#moduleShortIds', function () {
    it('should return module short ids from passages success requirements', async function () {
      const combinedCourseContent = [
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'abcdef-555',
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'abcdef-777',
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 8,
        },
      ];
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        content: combinedCourseContent,
      });
      expect(combinedCourseBlueprint.moduleShortIds).to.deep.equal(['abcdef-555', 'abcdef-777']);
    });

    it('should return empty list of ids if template has not any campaignParticipations success requirements', async function () {
      const combinedCourseContent = [
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 12,
        },
      ];
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        content: combinedCourseContent,
      });
      expect(combinedCourseBlueprint.moduleShortIds).to.deep.equal([]);
    });
  });

  describe('#getTargetProfileIds', function () {
    it('should return target profile ids from campaignParticipations success requirements', async function () {
      const combinedCourseContent = [
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 1,
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: 8,
        },
      ];
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        content: combinedCourseContent,
      });
      expect(combinedCourseBlueprint.targetProfileIds).to.deep.equal([1, 8]);
    });
    it('should return empty list of ids if template has not any campaignParticipations success requirements', async function () {
      const combinedCourseContent = [
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
        },
      ];
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name: 'combinix',
        content: combinedCourseContent,
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
      const modulesByShortId = {
        ecc13f55: [new Module({ id: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' })],
      };
      const combinedCourseContent = [
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: firstTargetProfileId,
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
          value: secondTargetProfileId,
        },
        {
          type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
          value: 'ecc13f55',
        },
      ];
      const description = 'bla bla bla';
      const illustration = 'illu.svg';

      // when
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        name,
        content: combinedCourseContent,
        description,
        illustration,
      });
      const combinedCourse = combinedCourseBlueprint.toCombinedCourse({
        code,
        organizationId,
        campaigns,
        modulesByShortId,
      });

      // then
      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              campaignId: {
                data: firstCampaignId,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
              status: {
                data: 'SHARED',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              campaignId: {
                data: secondCampaignId,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
              status: {
                data: 'SHARED',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              moduleId: {
                data: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
              isTerminated: {
                data: true,
                comparison: CRITERION_COMPARISONS.EQUAL,
              },
            },
          },
        ],
      });
      const questDTO = quest.toDTO();

      expect(combinedCourse).to.be.instanceOf(CombinedCourse);
      expect(combinedCourse.quest.toDTO().successRequirements).to.deep.equal(questDTO.successRequirements);
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
