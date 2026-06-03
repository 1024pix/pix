import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/CombinedCourseBlueprintForCreation.js';
import { QuestInput } from '../../../../../src/quest/domain/models/QuestInput.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | create-combined-course-blueprint', function () {
  it('should create a combined course blueprint with quest', async function () {
    // given
    const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    const attestation = databaseBuilder.factory.buildAttestation();
    await databaseBuilder.commit();

    const content = [
      { type: 'module', value: moduleId, shortId: '6a68bf32' },
      { type: 'evaluation', value: targetProfileId },
    ];
    const questInput = new QuestInput({
      items: content,
      rewardId: attestation.id,
      rewardType: REWARD_TYPES.ATTESTATION,
    });
    const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content,
      quest: questInput.toQuest(),
    });

    const expectedQuest = combinedCourseBlueprintForCreation.quest.toDTO();

    await usecases.createCombinedCourseBlueprint({ combinedCourseBlueprintForCreation });

    const combinedCourseBlueprints = await knex('combined_course_blueprints');
    const questLinkedToBlueprint = await knex('quests').where('id', combinedCourseBlueprints[0].questId).first();
    expect(combinedCourseBlueprints).lengthOf(1);
    expect(combinedCourseBlueprints[0].name).to.equal(combinedCourseBlueprintForCreation.name);
    expect(combinedCourseBlueprints[0].internalName).to.equal(combinedCourseBlueprintForCreation.internalName);
    expect(combinedCourseBlueprints[0].illustration).to.equal(combinedCourseBlueprintForCreation.illustration);
    expect(combinedCourseBlueprints[0].description).to.equal(combinedCourseBlueprintForCreation.description);

    expect(questLinkedToBlueprint.successRequirements).to.deep.equal(expectedQuest.successRequirements);
    expect(questLinkedToBlueprint.rewardId).to.deep.equal(expectedQuest.rewardId);
    expect(questLinkedToBlueprint.rewardType).to.deep.equal(expectedQuest.rewardType);

    expect(combinedCourseBlueprints[0].updatedAt).to.be.instanceOf(Date);
    expect(combinedCourseBlueprints[0].createdAt).to.be.instanceOf(Date);

    const quests = await knex('quests');
    expect(quests).lengthOf(1);
    expect(quests[0].successRequirements).deep.equal([
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO(),
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
    ]);
    expect(quests[0].rewardId).to.equal(attestation.id);
    expect(quests[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
  });

  it('should create a combined course blueprint quest without reward', async function () {
    // given
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    await databaseBuilder.commit();

    const content = [
      { type: 'module', value: '6282925d-4775-4bca-b513-4c3009ec5886', shortId: '6a68bf32' },
      { type: 'evaluation', value: targetProfileId },
    ];
    const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content,
      quest: new QuestInput({ items: content }).toQuest(),
    });

    await usecases.createCombinedCourseBlueprint({ combinedCourseBlueprintForCreation });

    const combinedCourseBlueprints = await knex('combined_course_blueprints');
    expect(combinedCourseBlueprints).lengthOf(1);

    const quests = await knex('quests');
    expect(quests).lengthOf(1);
    expect(quests[0].successRequirements).deep.equal([
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({
        moduleId: '6282925d-4775-4bca-b513-4c3009ec5886',
      }).toDTO(),
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
    ]);
    expect(quests[0].rewardId).to.be.null;
    expect(quests[0].rewardType).to.be.null;
  });

  it('should return error if a targetProfileId in content is not found', async function () {
    // given
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    await databaseBuilder.commit();

    const content = [
      { type: 'evaluation', value: targetProfileId },
      { type: 'evaluation', value: 123 },
    ];
    const combinedCourseBlueprintForCreation = new CombinedCourseBlueprintForCreation({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content,
      quest: new QuestInput({ items: content }).toQuest(),
    });

    const error = await catchErr(usecases.createCombinedCourseBlueprint)({ combinedCourseBlueprintForCreation });
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
