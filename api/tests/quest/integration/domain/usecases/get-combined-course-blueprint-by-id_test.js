import sinon from 'sinon';

import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprint } from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprint.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-blueprint-by-id', function () {
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should return a combined course blueprint for a given id', async function () {
    //given
    const { id: targetProfileId } = await databaseBuilder.factory.buildTargetProfile({ name: 'Mon profil cible' });

    const { id: rewardId, label: attestationLabel } = await databaseBuilder.factory.buildAttestation();

    const quest = databaseBuilder.factory.buildQuest({
      rewardType: REWARD_TYPES.ATTESTATION,
      rewardId,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          moduleId: '9beb922f-4d8e-495d-9c85-0e7265ca78d6',
        }).toDTO(),
      ],
    });
    await databaseBuilder.factory.buildCombinedCourseBlueprint({
      id: 1,
      questId: quest.id,
    });

    await databaseBuilder.commit();

    //when
    const adminCombinedCourseBlueprint = await usecases.getCombinedCourseBlueprintById({
      id: 1,
    });

    //then
    expect(adminCombinedCourseBlueprint).to.be.instanceOf(AdminCombinedCourseBlueprint);
    expect(adminCombinedCourseBlueprint).deep.contain({
      id: 1,
      name: 'Mon parcours combiné',
      internalName: 'Mon schéma de parcours combiné',
      description: 'Le but de ma quête',
      illustration: 'images/illustration.svg',
      createdAt: now,
      updatedAt: now,
      organizationIds: [],
      attestationLabel,
    });
    expect(adminCombinedCourseBlueprint.content).to.deep.equal(
      AdminCombinedCourseBlueprint.buildContentItems([{ targetProfileId }, { moduleShortId: 'e074af34' }]),
    );
  });

  it('should throw when no combined course blueprint is found for a given id', async function () {
    //when
    const error = await catchErr(usecases.getCombinedCourseBlueprintById)({ id: 1 });

    expect(error).to.be.instanceof(NotFoundError);
    expect(error.message).to.equal('Combined course blueprint not found');
  });
});
