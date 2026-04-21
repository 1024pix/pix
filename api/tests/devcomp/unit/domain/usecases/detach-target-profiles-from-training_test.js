import sinon from 'sinon';

import { detachTargetProfilesFromTraining } from '../../../../../src/devcomp/domain/usecases/detach-target-profiles-from-training.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | detach-target-profiles-from-training', function () {
  let targetProfileTrainingRepository;
  const trainingId = 1;
  const targetProfileId = 55;

  beforeEach(function () {
    targetProfileTrainingRepository = {
      remove: sinon.stub(),
    };
  });

  it('should call repository method to detach target profile from training, and return undefined', async function () {
    // given
    targetProfileTrainingRepository.remove.withArgs({ trainingId, targetProfileId }).resolves(true);

    // when
    const result = await detachTargetProfilesFromTraining({
      trainingId,
      targetProfileId,
      targetProfileTrainingRepository,
    });

    // then
    expect(targetProfileTrainingRepository.remove).to.have.been.calledOnce;
    expect(result).to.be.undefined;
  });

  it('should throw NotFoundError if target profile/training is not found', async function () {
    // given
    targetProfileTrainingRepository.remove.withArgs({ trainingId, targetProfileId }).resolves(false);

    // when
    const result = await catchErr(detachTargetProfilesFromTraining)({
      trainingId,
      targetProfileId,
      targetProfileTrainingRepository,
    });

    // then
    expect(result).to.be.instanceOf(NotFoundError);
  });
});
