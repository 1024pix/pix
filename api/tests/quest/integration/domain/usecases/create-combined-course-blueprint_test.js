import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprint } from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprint.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | create-combined-course-blueprint', function () {
  it('should create a combined course blueprint with quest', async function () {
    // given
    const moduleShortId = '6a68bf32';
    const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
    const modulesByShortId = { '6a68bf32': [{ id: '6282925d-4775-4bca-b513-4c3009ec5886' }] };
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    const attestation = databaseBuilder.factory.buildAttestation();
    await databaseBuilder.commit();

    const adminCombinedCourseBlueprint = new AdminCombinedCourseBlueprint({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content: AdminCombinedCourseBlueprint.buildContentItems([{ moduleShortId }, { targetProfileId }]),
      attestationKey: attestation.key,
    });

    const expectedCombinedCourseBlueprint = CombinedCourseBlueprint.buildWithQuest({
      adminCombinedCourseBlueprint,
      modulesByShortId,
      rewardId: attestation.id,
      rewardType: REWARD_TYPES.ATTESTATION,
    });

    const expectedQuest = expectedCombinedCourseBlueprint.quest.toDTO();

    await usecases.createCombinedCourseBlueprint({ adminCombinedCourseBlueprint });

    const combinedCourseBlueprints = await knex('combined_course_blueprints');
    const questLinkedToBlueprint = await knex('quests').where('id', combinedCourseBlueprints[0].questId).first();
    expect(combinedCourseBlueprints).lengthOf(1);
    expect(combinedCourseBlueprints[0].name).to.equal(adminCombinedCourseBlueprint.name);
    expect(combinedCourseBlueprints[0].internalName).to.equal(adminCombinedCourseBlueprint.internalName);
    expect(combinedCourseBlueprints[0].illustration).to.equal(adminCombinedCourseBlueprint.illustration);
    expect(combinedCourseBlueprints[0].description).to.equal(adminCombinedCourseBlueprint.description);

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

    const adminCombinedCourseBlueprint = new AdminCombinedCourseBlueprint({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content: AdminCombinedCourseBlueprint.buildContentItems([{ moduleShortId: '6a68bf32' }, { targetProfileId }]),
      attestationKey: undefined,
    });

    await usecases.createCombinedCourseBlueprint({ adminCombinedCourseBlueprint });

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

    const adminCombinedCourseBlueprint = new AdminCombinedCourseBlueprint({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content: AdminCombinedCourseBlueprint.buildContentItems([{ targetProfileId }, { targetProfileId: 123 }]),
    });

    const error = await catchErr(usecases.createCombinedCourseBlueprint)({ adminCombinedCourseBlueprint });
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('should return error if one of the modules in content is not found', async function () {
    // given
    const adminCombinedCourseBlueprint = new AdminCombinedCourseBlueprint({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      content: AdminCombinedCourseBlueprint.buildContentItems([
        { moduleShortId: '6a68bf32' },
        { moduleShortId: 'abc-123' },
      ]),
    });

    const error = await catchErr(usecases.createCombinedCourseBlueprint)({ adminCombinedCourseBlueprint });
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
