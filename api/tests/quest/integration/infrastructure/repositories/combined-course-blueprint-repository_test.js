import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/CombinedCourseBlueprintForCreation.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { QuestInput } from '../../../../../src/quest/domain/models/QuestInput.js';
import * as combinedCourseBluePrintRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-blueprint-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Integration | Repository | combined-course-blueprint', function () {
  describe('#save', function () {
    it('should create a combined course blueprint with its quest', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const content = [
        { type: 'evaluation', value: targetProfileId },
        { type: 'module', value: '6282925d-4775-4bca-b513-4c3009ec5886', shortId: '6a68bf32' },
      ];
      const combinedCourseBlueprint = new CombinedCourseBlueprint({
        ...new CombinedCourseBlueprintForCreation({
          name: 'Combined course IA',
          internalName: 'Ia combined course blueprint',
          description: "L'ia c'est magique",
          illustration: 'illustration/ia.svg',
          content,
          organizationIds: [],
          quest: new QuestInput({ items: content }).toQuest(),
        }),
      });

      // when
      const savedCombinedCourseBlueprint = await combinedCourseBluePrintRepository.save({ combinedCourseBlueprint });

      // then
      const results = await combinedCourseBluePrintRepository.findAll();

      expect(results).lengthOf(1);
      expect(results[0]).deep.equal(savedCombinedCourseBlueprint);
      expect(results[0]).deep.contain({ ...combinedCourseBlueprint.combinedCourseBlueprint });
      expect(results[0].quest.toDTO().successRequirements).deep.equal([
        {
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            status: {
              comparison: CRITERION_COMPARISONS.EQUAL,
              data: CampaignParticipationStatuses.SHARED,
            },
            targetProfileId: {
              comparison: CRITERION_COMPARISONS.EQUAL,
              data: targetProfileId,
            },
          },
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
        },
        {
          comparison: REQUIREMENT_COMPARISONS.ALL,
          requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
          data: {
            isTerminated: { comparison: CRITERION_COMPARISONS.EQUAL, data: true },
            moduleId: {
              comparison: CRITERION_COMPARISONS.EQUAL,
              data: '6282925d-4775-4bca-b513-4c3009ec5886',
            },
          },
        },
      ]);
    });

    it('should delete combined course blueprint share for a given organizationId', async function () {
      // given
      const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
      const combinedCourseBlueprintShare2 = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        combinedCourseBlueprintId: combinedCourseBlueprintShare.combinedCourseBlueprintId,
      });

      await databaseBuilder.commit();

      const combinedCourseBlueprint = await combinedCourseBluePrintRepository.findById({
        id: combinedCourseBlueprintShare.combinedCourseBlueprintId,
      });

      combinedCourseBlueprint.detachOrganization({ organizationId: combinedCourseBlueprintShare.organizationId });

      // when
      const result = await combinedCourseBluePrintRepository.save({ combinedCourseBlueprint });

      expect(result.organizationIds).deep.equal([combinedCourseBlueprintShare2.organizationId]);
    });

    it('should add combined course blueprint share for a given organizationId', async function () {
      // given
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();

      const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId: organization1.id,
      });

      await databaseBuilder.commit();

      const combinedCourseBlueprint = await combinedCourseBluePrintRepository.findById({
        id: combinedCourseBlueprintShare.combinedCourseBlueprintId,
      });

      combinedCourseBlueprint.attachOrganizations({
        organizationIds: [organization1.id, organization2.id],
      });

      // when
      const result = await combinedCourseBluePrintRepository.save({ combinedCourseBlueprint });

      expect(result.organizationIds).deep.equal([organization1.id, organization2.id]);
    });

    it('should update a combined course blueprint and its quest', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const quest = databaseBuilder.factory.buildQuest({
        rewardType: null,
        rewardId: null,
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: '6282925d-4775-4bca-b513-4c3009ec5886',
          }).toDTO(),
        ],
      });
      const combinedCourseBlueprintInDb = databaseBuilder.factory.buildCombinedCourseBlueprint({
        questId: quest.id,
      });

      await databaseBuilder.commit();

      const updatedContent = [{ type: 'module', value: '6282925d-4775-4bca-b513-4c3009ec5886', shortId: '6a68bf32' }];
      const combinedCourseBlueprintWithoutTargetProfile = new CombinedCourseBlueprint({
        ...new CombinedCourseBlueprintForCreation({
          id: combinedCourseBlueprintInDb.id,
          name: 'Updated Combined course IA',
          internalName: 'Ia combined course blueprint',
          description: "L'ia c'est magique",
          illustration: 'illustration/ia.svg',
          content: updatedContent,
          organizationIds: [],
          quest: new QuestInput({ items: updatedContent }).toQuest(),
        }),
      });

      // when
      await combinedCourseBluePrintRepository.save({
        combinedCourseBlueprint: combinedCourseBlueprintWithoutTargetProfile,
      });

      // then
      const results = await combinedCourseBluePrintRepository.findAll();
      expect(results).lengthOf(1);
      expect(results[0].name).equal('Updated Combined course IA');
      expect(results[0].quest.toDTO().successRequirements).deep.equal([
        {
          comparison: REQUIREMENT_COMPARISONS.ALL,
          requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
          data: {
            isTerminated: { comparison: CRITERION_COMPARISONS.EQUAL, data: true },
            moduleId: {
              comparison: CRITERION_COMPARISONS.EQUAL,
              data: '6282925d-4775-4bca-b513-4c3009ec5886',
            },
          },
        },
      ]);
    });
  });

  describe('#findAll', function () {
    it('should return all combined course blueprints with quests', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const questId = databaseBuilder.factory.buildQuest({
        rewardType: null,
        rewardId: null,
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: '6282925d-4775-4bca-b513-4c3009ec5886',
          }).toDTO(),
        ],
      }).id;

      const expectedCombinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({
        questId,
      });
      databaseBuilder.factory.buildCombinedCourseBlueprint();
      await databaseBuilder.commit();

      // when
      const results = await combinedCourseBluePrintRepository.findAll();

      // then
      expect(results).lengthOf(2);
      expect(results[0]).to.be.instanceOf(CombinedCourseBlueprint);
      expect(results[0]).to.deep.contain({
        id: expectedCombinedCourseBlueprint.id,
        name: expectedCombinedCourseBlueprint.name,
        internalName: expectedCombinedCourseBlueprint.internalName,
        description: expectedCombinedCourseBlueprint.description,
        illustration: expectedCombinedCourseBlueprint.illustration,
        createdAt: expectedCombinedCourseBlueprint.createdAt,
        updatedAt: expectedCombinedCourseBlueprint.updatedAt,
      });
      expect(JSON.stringify(results[0].content)).to.deep.equal(expectedCombinedCourseBlueprint.content);
      expect(results[0].quest.id).to.equal(questId);
    });

    it('should return an empty array when no results are found', async function () {
      const result = await combinedCourseBluePrintRepository.findAll();
      expect(result).lengthOf(0);
    });
  });

  describe('#findById', function () {
    it('should return combined course blueprint by its id with shared organization ids', async function () {
      const quest = databaseBuilder.factory.buildQuestForCombinedCourse();
      const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: quest.id });
      const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        combinedCourseBlueprintId: combinedCourseBlueprint.id,
      });
      await databaseBuilder.commit();

      const expectedCombinedCourseBlueprint = domainBuilder.buildCombinedCourseBlueprint({
        ...combinedCourseBlueprint,
        organizationIds: [combinedCourseBlueprintShare.organizationId],
      });

      const result = await combinedCourseBluePrintRepository.findById({ id: expectedCombinedCourseBlueprint.id });

      expect(result.organizationIds).to.deep.equal([combinedCourseBlueprintShare.organizationId]);
      expect(result).to.be.instanceOf(CombinedCourseBlueprint);
      expect(result).to.deep.contain({
        id: expectedCombinedCourseBlueprint.id,
        name: expectedCombinedCourseBlueprint.name,
        internalName: expectedCombinedCourseBlueprint.internalName,
        description: expectedCombinedCourseBlueprint.description,
        illustration: expectedCombinedCourseBlueprint.illustration,
        createdAt: expectedCombinedCourseBlueprint.createdAt,
        updatedAt: expectedCombinedCourseBlueprint.updatedAt,
        organizationIds: expectedCombinedCourseBlueprint.organizationIds,
      });
      expect(result.quest.toDTO()).to.deep.equal(quest);
    });

    it('should return combined course blueprint by its id when it is not shared', async function () {
      const quest = databaseBuilder.factory.buildQuestForCombinedCourse();
      const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: quest.id });
      await databaseBuilder.commit();

      const expectedCombinedCourseBlueprint = domainBuilder.buildCombinedCourseBlueprint({
        ...combinedCourseBlueprint,
      });

      const result = await combinedCourseBluePrintRepository.findById({ id: expectedCombinedCourseBlueprint.id });
      expect(result.organizationIds).to.deep.equal([]);
      expect(result).to.be.instanceOf(CombinedCourseBlueprint);
      expect(result).to.deep.contain({
        id: expectedCombinedCourseBlueprint.id,
        name: expectedCombinedCourseBlueprint.name,
        internalName: expectedCombinedCourseBlueprint.internalName,
        description: expectedCombinedCourseBlueprint.description,
        illustration: expectedCombinedCourseBlueprint.illustration,
        createdAt: expectedCombinedCourseBlueprint.createdAt,
        updatedAt: expectedCombinedCourseBlueprint.updatedAt,
        organizationIds: [],
      });
      expect(result.quest.toDTO()).to.deep.equal(quest);
    });

    it('should return null when no results are found', async function () {
      const result = await combinedCourseBluePrintRepository.findById({ id: 123 });
      expect(result).null;
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return blueprint if the given organization has at least one combined course blueprint share', async function () {
      //given
      const blueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
      const blueprintShare2 = databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId: blueprintShare.organizationId,
      });

      databaseBuilder.factory.buildCombinedCourseBlueprintShare();

      await databaseBuilder.commit();

      const expectedCombinedCourseBlueprint = await combinedCourseBluePrintRepository.findById({
        id: blueprintShare.combinedCourseBlueprintId,
      });

      const expectedCombinedCourseBlueprint2 = await combinedCourseBluePrintRepository.findById({
        id: blueprintShare2.combinedCourseBlueprintId,
      });

      //when
      const result = await combinedCourseBluePrintRepository.findByOrganizationId({
        organizationId: blueprintShare.organizationId,
      });

      //then
      expect(result.length).to.equal(2);
      expect(result[0]).to.deep.equal(expectedCombinedCourseBlueprint);
      expect(result[1]).to.deep.equal(expectedCombinedCourseBlueprint2);
    });

    it('should return an empty array when the organization is not found', async function () {
      const result = await combinedCourseBluePrintRepository.findByOrganizationId({ organizationId: 123 });

      expect(result.length).to.equal(0);
    });

    it('should return an empty array when the organization has no shares', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const result = await combinedCourseBluePrintRepository.findByOrganizationId({ organizationId });

      expect(result.length).to.equal(0);
    });
  });
});
