import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseForCreation } from '../../../../../src/quest/domain/models/combined-courses/value-objects/CombinedCourseForCreation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { ForbiddenAccess, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | create-combined-course', function () {
  it('should create combined course for given payload', async function () {
    // given
    const moduleId1 = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
    const moduleId2 = 'f32a2238-4f65-4698-b486-15d51935d335';
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    const targetProfileWithTraining = databaseBuilder.factory.buildTargetProfile();
    const otherTargetProfile = databaseBuilder.factory.buildTargetProfile();

    const trainingId = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      title: 'Demo combinix 1',
      link: '/modules/demo-combinix-1',
      locale: 'fr-fr',
    }).id;

    databaseBuilder.factory.buildTargetProfileTraining({
      targetProfileId: targetProfileWithTraining.id,
      trainingId: trainingId,
    });

    const attestation = databaseBuilder.factory.buildAttestation();

    const quest = databaseBuilder.factory.buildQuest({
      rewardId: attestation.id,
      rewardType: REWARD_TYPES.ATTESTATION,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId: targetProfileWithTraining.id,
        }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: otherTargetProfile.id }).toDTO(),
      ],
    });

    const combinedCourseBlueprintId = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: quest.id }).id;
    databaseBuilder.factory.buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId });

    await databaseBuilder.commit();

    const nameInput = 'Un parcours combiné';

    const combinedCourseForCreation = new CombinedCourseForCreation({
      blueprintId: combinedCourseBlueprintId,
      organizationId,
      name: nameInput,
    });

    // when
    await usecases.createCombinedCourse({
      combinedCourseForCreation,
      creatorId: userId,
    });

    const campaigns = await knex('campaigns')
      .where({ organizationId })
      .whereIn('targetProfileId', [otherTargetProfile.id, targetProfileWithTraining.id])
      .orderBy('id');

    // then
    const [createdQuest] = await knex('quests')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', organizationId)
      .orderBy('quests.id');

    // Quest
    expect(createdQuest.combinedCourseBlueprintId).to.equal(combinedCourseBlueprintId);
    expect(createdQuest.code).not.to.be.null;
    expect(createdQuest.name).to.equal(nameInput);
    expect(createdQuest.rewardId).to.equal(attestation.id);
    expect(createdQuest.rewardType).to.equal(REWARD_TYPES.ATTESTATION);

    //Campaign 1
    expect(campaigns[0].name).to.equal(targetProfileWithTraining.internalName);
    expect(campaigns[0].title).to.equal(targetProfileWithTraining.name);
    expect(campaigns[0].customResultPageButtonUrl.includes('/chargement')).true;
    expect(campaigns[0].customResultPageButtonText).to.equal('Continuer');

    expect(campaigns[1].name).to.equal(otherTargetProfile.internalName);
    expect(campaigns[1].title).to.equal(otherTargetProfile.name);
    expect(campaigns[1].customResultPageButtonUrl.includes('/chargement')).false;
    expect(campaigns[1].customResultPageButtonText).to.equal('Continuer');
  });

  it('should throw NotFoundError when blueprint is not found with the id in payload', async function () {
    //given
    const combinedCourseBlueprintId = databaseBuilder.factory.buildCombinedCourseBlueprint().id;
    const { organizationId } = databaseBuilder.factory.buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId });
    const userId = databaseBuilder.factory.buildUser().id;

    await databaseBuilder.commit();

    const nameInput = 'Un parcours combiné';

    const combinedCourseForCreation = new CombinedCourseForCreation({
      blueprintId: 999,
      organizationId,
      name: nameInput,
    });

    // when
    const error = await catchErr(usecases.createCombinedCourse)({
      combinedCourseForCreation,
      creatorId: userId,
    });

    //then
    expect(error).to.be.instanceOf(NotFoundError);
  });
  it('should throw ForbiddenAccess error when blueprint is not linked to the organization', async function () {
    // given
    const moduleId1 = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
    const moduleId2 = 'f32a2238-4f65-4698-b486-15d51935d335';
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const targetProfileWithTraining = databaseBuilder.factory.buildTargetProfile();
    const otherTargetProfile = databaseBuilder.factory.buildTargetProfile();

    const trainingId = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      title: 'Demo combinix 1',
      link: '/modules/demo-combinix-1',
      locale: 'fr-fr',
    }).id;

    databaseBuilder.factory.buildTargetProfileTraining({
      targetProfileId: targetProfileWithTraining.id,
      trainingId: trainingId,
    });

    const attestation = databaseBuilder.factory.buildAttestation();

    const quest = databaseBuilder.factory.buildQuest({
      rewardId: attestation.id,
      rewardType: REWARD_TYPES.ATTESTATION,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId: targetProfileWithTraining.id,
        }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: otherTargetProfile.id }).toDTO(),
      ],
    });

    const combinedCourseBlueprintId = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: quest.id }).id;
    databaseBuilder.factory.buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId });

    await databaseBuilder.commit();

    const nameInput = 'Un parcours combiné';

    const combinedCourseForCreation = new CombinedCourseForCreation({
      blueprintId: combinedCourseBlueprintId,
      organizationId: otherOrganizationId,
      name: nameInput,
    });

    // when
    const error = await catchErr(usecases.createCombinedCourse)({
      combinedCourseForCreation,
      creatorId: userId,
    });

    expect(error).to.be.instanceOf(ForbiddenAccess);
  });
});
