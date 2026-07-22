import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import * as combinedCourseRepository from '../../../../../src/quest/infrastructure/repositories/combined-courses/combined-course-repository.js';
import * as questRepository from '../../../../../src/quest/infrastructure/repositories/quest-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Repository | combined-course', function () {
  describe('#getByCode', function () {
    it('should return a combined course if code exists', async function () {
      // given
      const code = 'SOMETHING';
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({
        surveyUrl: 'http://link.to/survey',
      });
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        combinedCourseBlueprintId: combinedCourseBlueprint.id,
      });
      await databaseBuilder.commit();

      // when
      const combinedCourseResult = await combinedCourseRepository.getByCode({ code });

      // then
      expect(combinedCourseResult).to.be.an.instanceof(CombinedCourse);
      expect(combinedCourseResult).to.deep.equal(
        new CombinedCourse({
          ...combinedCourse,
          blueprintId: combinedCourseBlueprint.id,
          baseSurveyUrl: combinedCourseBlueprint.surveyUrl,
        }),
      );
    });

    it('should throw NotFoundError if combined course does not exist', async function () {
      // given
      const code = 'NOTHINGTT';

      // when
      const error = await catchErr(combinedCourseRepository.getByCode)({ code });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Le parcours combiné portant le code ${code} n'existe pas`);
    });

    it('should throw NotFoundError if combined course is deleted', async function () {
      // given
      const code = 'SOMETHING';
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId, deletedAt: new Date() });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(combinedCourseRepository.getByCode)({ code });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Le parcours combiné portant le code ${code} n'existe pas`);
    });
  });

  describe('#getById', function () {
    it('should return a combined course if exists', async function () {
      // given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse({ code: 'COMBINIX1', organizationId });
      await databaseBuilder.commit();

      // when
      const combinedCourseResult = await combinedCourseRepository.getById({ id: combinedCourse.id });

      // then
      expect(combinedCourseResult).to.be.an.instanceof(CombinedCourse);
      expect(combinedCourseResult).to.deep.equal(
        new CombinedCourse({ ...combinedCourse, blueprintId: combinedCourse.combinedCourseBlueprintId }),
      );
    });

    it('should throw NotFoundError if combined course does not exist', async function () {
      // given
      const id = 1;

      // when
      const error = await catchErr(combinedCourseRepository.getById)({ id });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Le parcours combiné pour l'id ${id} n'existe pas`);
    });

    it('should throw NotFoundError if combined course is deleted', async function () {
      // given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINIX1',
        organizationId,
        deletedAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(combinedCourseRepository.getById)({ id: combinedCourse.id });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Le parcours combiné pour l'id ${combinedCourse.id} n'existe pas`);
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return all combined courses for a given organization ordered by creation date descending with pagination metadata', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const combinedCourse1 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId,
        createdAt: new Date('2024-01-01'),
      });
      const combinedCourse2 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE2',
        name: 'Parcours 2',
        organizationId,
        createdAt: new Date('2025-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const result = await combinedCourseRepository.findByOrganizationId({ organizationId, page: 1, size: 10 });

      // then
      expect(result.combinedCourses).to.have.lengthOf(2);
      expect(result.combinedCourses[0]).to.be.an.instanceof(CombinedCourse);
      expect(result.combinedCourses[1]).to.be.an.instanceof(CombinedCourse);
      expect(result.combinedCourses[0]).to.deep.equal(
        new CombinedCourse({ ...combinedCourse2, blueprintId: combinedCourse2.combinedCourseBlueprintId }),
      );
      expect(result.combinedCourses[1]).to.deep.equal(
        new CombinedCourse({ ...combinedCourse1, blueprintId: combinedCourse1.combinedCourseBlueprintId }),
      );
      expect(result.meta).to.deep.include({
        page: 1,
        pageSize: 10,
        rowCount: 2,
        pageCount: 1,
      });
    });

    it('should return an empty array when organization has no combined courses', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await combinedCourseRepository.findByOrganizationId({ organizationId, page: 1, size: 10 });

      // then
      expect(result.combinedCourses).to.deep.equal([]);
      expect(result.meta).to.deep.include({
        page: 1,
        pageSize: 10,
        rowCount: 0,
        pageCount: 0,
      });
    });

    it('should not return combined courses from other organizations', async function () {
      // given
      const organization1Id = databaseBuilder.factory.buildOrganization().id;
      const organization2Id = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId: organization1Id,
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE2',
        name: 'Parcours 2',
        organizationId: organization2Id,
      });
      await databaseBuilder.commit();

      // when
      const result = await combinedCourseRepository.findByOrganizationId({
        organizationId: organization1Id,
        page: 1,
        size: 10,
      });

      // then
      expect(result.combinedCourses).to.have.lengthOf(1);
      expect(result.combinedCourses[0].organizationId).to.equal(organization1Id);
    });

    it('should not return deleted combined courses', async function () {
      // given
      const organization1Id = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId: organization1Id,
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE2',
        name: 'Parcours 2',
        organizationId: organization1Id,
        deletedAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const result = await combinedCourseRepository.findByOrganizationId({
        organizationId: organization1Id,
        page: 1,
        size: 10,
      });

      // then
      expect(result.combinedCourses).to.have.lengthOf(1);
      expect(result.combinedCourses[0].organizationId).to.equal(organization1Id);
    });
  });

  describe('#findByCampaignId', function () {
    let organizationId, combinedCourse, campaignId;

    beforeEach(async function () {
      // given
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      combinedCourse = databaseBuilder.factory.buildCombinedCourse({
        organizationId,
        questId,
      });
      await databaseBuilder.commit();
    });

    it('should return not deleted combined courses that include a given campaignId', async function () {
      // given
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        organizationId,
        questId,
        deletedAt: new Date(),
      });

      // when
      const combinedCourseResult = await combinedCourseRepository.findByCampaignId({ campaignId });

      // then
      expect(combinedCourseResult).lengthOf(1);
      expect(combinedCourseResult[0]).instanceof(CombinedCourse);
      expect(combinedCourseResult[0]).deep.equal(
        new CombinedCourse({ ...combinedCourse, blueprintId: combinedCourse.combinedCourseBlueprintId }),
      );
    });

    it('should return empty array if no combined course match campaignId', async function () {
      // given
      const campaignIdNotInQuest = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      await databaseBuilder.commit();

      // when
      const combinedCourseResult = await combinedCourseRepository.findByCampaignId({
        campaignId: campaignIdNotInQuest,
      });

      // then
      expect(combinedCourseResult).deep.equal([]);
    });
  });

  describe('targetProfileIdsPartOfAnyCombinedCourse', function () {
    it('should return an array containing only targetProfileIds contained in a combinedCourse', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId,
      });
      const campaignIdNotInQuest = databaseBuilder.factory.buildCampaign({
        organizationId,
      });
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
        ],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        description: 'Le but de ma quête',
        illustration: 'images/illustration.svg',
        questId,
      });
      await databaseBuilder.commit();

      // when
      const targetProfileIdsPartOfAnyCombinedCourse =
        await combinedCourseRepository.targetProfileIdsPartOfAnyCombinedCourse({
          targetProfileIds: [campaignIdNotInQuest.targetProfileId, campaign.targetProfileId],
        });

      // then
      expect(targetProfileIdsPartOfAnyCombinedCourse).deep.equal([campaign.targetProfileId]);
    });

    it('should return an empty array when target profiles are part of no combined courses', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const code = 'ABCDE1234';
      const name = 'Mon parcours Combiné';
      const description = 'Le but de ma quête';
      const illustration = 'images/illustration.svg';
      databaseBuilder.factory.buildCombinedCourse({
        code,
        name,
        organizationId,
        description,
        illustration,
      });
      await databaseBuilder.commit();

      // when
      const targetProfileIdsPartOfAnyCombinedCourse =
        await combinedCourseRepository.targetProfileIdsPartOfAnyCombinedCourse({
          targetProfileIds: [123],
        });

      // then
      expect(targetProfileIdsPartOfAnyCombinedCourse).deep.equal([]);
    });
  });

  describe('#saveInBatch', function () {
    it('should create quests related to given combined courses', async function () {
      // given
      const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: 1,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
      ];
      const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint();
      await databaseBuilder.commit();

      const quest = new Quest({
        successRequirements,
        eligibilityRequirements: [],
      });
      const firstCombinedCourse = new CombinedCourse(
        {
          name: 'firstCombinedCourse',
          code: 'firstCode',
          organizationId: firstOrganizationId,
          illustration: 'mon_illu.svg',
          description: 'ma description',
          blueprintId: combinedCourseBlueprint.id,
        },
        quest,
      );
      const secondCombinedCourse = new CombinedCourse(
        {
          name: 'secondCombinedCourse',
          code: 'secondCode',
          organizationId: secondOrganizationId,
          blueprintId: combinedCourseBlueprint.id,
        },
        quest,
      );

      // when
      await combinedCourseRepository.saveInBatch({
        combinedCourses: [firstCombinedCourse, secondCombinedCourse],
        questRepository,
      });

      // then
      const firstSavedQuest = await knex('combined_courses')
        .join('quests', 'quests.id', 'combined_courses.questId')
        .where('combined_courses.organizationId', firstOrganizationId)
        .first();

      const secondSavedQuest = await knex('combined_courses')
        .join('quests', 'quests.id', 'combined_courses.questId')
        .where('combined_courses.organizationId', secondOrganizationId)
        .first();

      expect(firstSavedQuest.successRequirements).to.deep.equal(successRequirements);

      expect(secondSavedQuest.successRequirements).to.deep.equal(successRequirements);
    });

    it('should save given combined course on combined_courses', async function () {
      // given
      const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: 1,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
      ];
      const firstCombinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ content: [] });
      const secondCombinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ content: [] });
      await databaseBuilder.commit();

      const quest = new Quest({
        successRequirements,
        eligibilityRequirements: [],
      });
      const firstCombinedCourse = new CombinedCourse(
        {
          name: 'firstCombinedCourse',
          code: 'firstCode',
          organizationId: firstOrganizationId,
          illustration: 'mon_illu.svg',
          description: 'ma description',
          blueprintId: firstCombinedCourseBlueprint.id,
        },
        quest,
      );
      const secondCombinedCourse = new CombinedCourse(
        {
          name: 'secondCombinedCourse',
          code: 'secondCode',
          organizationId: secondOrganizationId,
          blueprintId: secondCombinedCourseBlueprint.id,
        },
        quest,
      );

      // when
      await combinedCourseRepository.saveInBatch({
        combinedCourses: [firstCombinedCourse, secondCombinedCourse],
        questRepository,
      });

      // then
      const firstSavedCombinedCourse = await knex('combined_courses')
        .where('combined_courses.organizationId', firstOrganizationId)
        .first();
      const secondSavedCombinedCourse = await knex('combined_courses')
        .where('combined_courses.organizationId', secondOrganizationId)
        .first();

      expect(firstSavedCombinedCourse.combinedCourseBlueprintId).to.equal(firstCombinedCourseBlueprint.id);
      expect(firstSavedCombinedCourse.name).to.equal('firstCombinedCourse');
      expect(firstSavedCombinedCourse.description).equal('ma description');
      expect(firstSavedCombinedCourse.illustration).equal('mon_illu.svg');
      expect(firstSavedCombinedCourse.code).equal('firstCode');

      expect(secondSavedCombinedCourse.combinedCourseBlueprintId).to.equal(secondCombinedCourseBlueprint.id);
      expect(secondSavedCombinedCourse.name).to.equal('secondCombinedCourse');
      expect(secondSavedCombinedCourse.description).null;
      expect(secondSavedCombinedCourse.illustration).null;
      expect(secondSavedCombinedCourse.code).equal('secondCode');
    });
  });

  describe('#save', function () {
    it('should return adequate model instance after creation', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint();

      const successRequirements = [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: 1,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
      ];

      const quest = new Quest({
        eligibilityRequirements: [],
        successRequirements,
      });

      const combinedCourse = new CombinedCourse(
        {
          name: combinedCourseBlueprint.internalName,
          code: 'ABCDEF',
          organizationId,
          description: combinedCourseBlueprint.description,
          illustration: combinedCourseBlueprint.illustration,
          blueprintId: combinedCourseBlueprint.id,
        },
        quest,
      );

      await databaseBuilder.commit();

      // when
      await combinedCourseRepository.save({ combinedCourse, questRepository });

      // then
      const savedQuest = await knex
        .select('quests.id', 'quests.successRequirements')
        .from('quests')
        .join('combined_courses', 'quests.id', 'combined_courses.questId')
        .where('combined_courses.organizationId', organizationId)
        .first();

      const savedCombinedCourse = await knex('combined_courses')
        .where('combined_courses.organizationId', organizationId)
        .first();

      //expect(savedQuest.successRequirements).to.deep.equal(successRequirements);
      expect(savedCombinedCourse.questId).to.deep.equal(savedQuest.id);
      expect(savedCombinedCourse.combinedCourseBlueprintId).to.equal(combinedCourseBlueprint.id);
      expect(savedCombinedCourse.code).equal(combinedCourse.code);
      expect(savedCombinedCourse.organizationId).equal(organizationId);
    });
  });

  describe('#findByModuleIdAndOrganizationIds', function () {
    let organizationId, organizationId2, moduleId;
    let combinedCourseWithModule, combinedCourseWithModuleAndOtherOrga;

    beforeEach(async function () {
      //given
      organizationId = databaseBuilder.factory.buildOrganization().id;
      organizationId2 = databaseBuilder.factory.buildOrganization().id;
      moduleId = 'module-abc';

      const { id: questIdModule1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
      });
      combinedCourseWithModule = databaseBuilder.factory.buildCombinedCourse({
        code: 'QWERTY123',
        name: 'name1',
        organizationId,
        questId: questIdModule1,
      });

      const { id: questIdModule2 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
      });
      combinedCourseWithModuleAndOtherOrga = databaseBuilder.factory.buildCombinedCourse({
        code: 'AZERTY456',
        name: 'name3',
        organizationId: organizationId2,
        questId: questIdModule2,
      });

      const { id: questIdModuleCde } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'module-cde' }).toDTO(),
        ],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'QWERTY456',
        name: 'name4',
        organizationId,
        questId: questIdModuleCde,
      });

      const { id: questIdModule3 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'QWERTY789',
        name: 'name5',
        organizationId,
        questId: questIdModule3,
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();
    });

    it('should return not deleted combined course for a given module id and organization ids', async function () {
      // given
      const { id: questIdOther } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
      });
      const otherCombinedCourseWithModule = databaseBuilder.factory.buildCombinedCourse({
        code: 'AZERTY123',
        name: 'name2',
        organizationId,
        questId: questIdOther,
      });

      await databaseBuilder.commit();

      //when
      const result = await combinedCourseRepository.findByModuleIdAndOrganizationIds({
        moduleId,
        organizationIds: [organizationId],
      });

      //then
      expect(result).lengthOf(2);
      expect(result[0]).instanceOf(CombinedCourse);
      expect(result[1]).instanceOf(CombinedCourse);
      expect(result).deep.members([
        {
          id: combinedCourseWithModule.id,
          code: combinedCourseWithModule.code,
          organizationId: combinedCourseWithModule.organizationId,
          name: combinedCourseWithModule.name,
          description: combinedCourseWithModule.description,
          illustration: combinedCourseWithModule.illustration,
          participations: [],
          questId: combinedCourseWithModule.questId,
          blueprintId: combinedCourseWithModule.combinedCourseBlueprintId,
          baseSurveyUrl: null,
          deletedAt: null,
          deletedBy: null,
        },
        {
          id: otherCombinedCourseWithModule.id,
          code: otherCombinedCourseWithModule.code,
          organizationId: otherCombinedCourseWithModule.organizationId,
          name: otherCombinedCourseWithModule.name,
          description: otherCombinedCourseWithModule.description,
          illustration: otherCombinedCourseWithModule.illustration,
          participations: [],
          questId: otherCombinedCourseWithModule.questId,
          blueprintId: otherCombinedCourseWithModule.combinedCourseBlueprintId,
          baseSurveyUrl: null,
          deletedAt: null,
          deletedBy: null,
        },
      ]);
    });

    it('should return not deleted combined course for a same moduleId and multiple organizationIds', async function () {
      //when
      const result = await combinedCourseRepository.findByModuleIdAndOrganizationIds({
        moduleId,
        organizationIds: [organizationId, organizationId2],
      });

      //then
      expect(result).lengthOf(2);
      expect(result[0]).instanceOf(CombinedCourse);
      expect(result[1]).instanceOf(CombinedCourse);
      expect(result).deep.members([
        {
          id: combinedCourseWithModule.id,
          code: combinedCourseWithModule.code,
          organizationId: combinedCourseWithModule.organizationId,
          name: combinedCourseWithModule.name,
          description: combinedCourseWithModule.description,
          illustration: combinedCourseWithModule.illustration,
          participations: [],
          questId: combinedCourseWithModule.questId,
          blueprintId: combinedCourseWithModule.combinedCourseBlueprintId,
          baseSurveyUrl: null,
          deletedAt: null,
          deletedBy: null,
        },
        {
          id: combinedCourseWithModuleAndOtherOrga.id,
          code: combinedCourseWithModuleAndOtherOrga.code,
          organizationId: combinedCourseWithModuleAndOtherOrga.organizationId,
          name: combinedCourseWithModuleAndOtherOrga.name,
          description: combinedCourseWithModuleAndOtherOrga.description,
          illustration: combinedCourseWithModuleAndOtherOrga.illustration,
          participations: [],
          questId: combinedCourseWithModuleAndOtherOrga.questId,
          blueprintId: combinedCourseWithModuleAndOtherOrga.combinedCourseBlueprintId,
          deletedAt: null,
          baseSurveyUrl: null,
          deletedBy: null,
        },
      ]);
    });

    it('should return an empty array when the tuple organizationId and moduleId is not found in combined_courses', async function () {
      //given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const moduleId = 'module-abc';

      await databaseBuilder.commit();

      //when
      const result = await combinedCourseRepository.findByModuleIdAndOrganizationIds({
        moduleId,
        organizationIds: [organizationId],
      });

      //then
      expect(result).lengthOf(0);
    });
  });

  describe('#deleteCombinedCourses', function () {
    it('should fill deletedAt, deletedBy and updates updatedAt for combined course', async function () {
      //given
      const { userId, organizationId } = databaseBuilder.factory.buildMembership();
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code: 'QWERTY123',
        name: 'name1',
        organizationId,
      });

      const otherCombinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code: 'AZERTY123',
        name: 'name2',
        organizationId,
      });

      await databaseBuilder.commit();

      //when
      await combinedCourseRepository.deleteCombinedCourses({
        combinedCourseIds: [combinedCourse.id],
        deletedBy: userId,
      });

      const allCombinedCourses = await knex('combined_courses');
      const notDeletedCombinedCourse = await knex('combined_courses').where('id', otherCombinedCourse.id).first();
      const deletedCombinedCourse = await knex('combined_courses').where('id', combinedCourse.id).first();

      //then
      expect(allCombinedCourses).to.have.lengthOf(2);
      expect(notDeletedCombinedCourse.deletedAt).to.be.null;
      expect(notDeletedCombinedCourse.deletedBy).to.be.null;
      expect(deletedCombinedCourse.deletedAt).to.not.be.null;
      expect(deletedCombinedCourse.deletedBy).to.equal(userId);
    });
  });

  describe('#updateCombinedCourses', function () {
    let lastUpdatedAt;

    beforeEach(async function () {
      lastUpdatedAt = new Date('2023-01-01');
    });

    it('should update name for given combined courses ids', async function () {
      //given
      const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code: 'QWERTY123',
        name: 'name1',
        updatedAt: lastUpdatedAt,
      });

      const otherCombinedCourse = databaseBuilder.factory.buildCombinedCourse({
        code: 'AZERTY123',
        name: 'name2',
        updatedAt: lastUpdatedAt,
      });

      await databaseBuilder.commit();

      //when
      await combinedCourseRepository.updateCombinedCourses({
        combinedCourseIds: [combinedCourse.id],
        name: 'new-name',
      });

      const allCombinedCourses = await knex('combined_courses');
      const notUpdatedCombinedCourse = await knex('combined_courses').where('id', otherCombinedCourse.id).first();
      const updatedCombinedCourse = await knex('combined_courses').where('id', combinedCourse.id).first();

      //then
      expect(allCombinedCourses).to.have.lengthOf(2);
      expect(notUpdatedCombinedCourse.updatedAt).to.not.be.above(lastUpdatedAt);
      expect(notUpdatedCombinedCourse.name).to.equal(otherCombinedCourse.name);
      expect(updatedCombinedCourse.updatedAt).to.be.above(lastUpdatedAt);
      expect(updatedCombinedCourse.name).to.equal('new-name');
    });
  });
});
