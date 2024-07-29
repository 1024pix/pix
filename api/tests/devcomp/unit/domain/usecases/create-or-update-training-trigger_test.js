import { createOrUpdateTrainingTrigger } from '../../../../../src/devcomp/domain/usecases/create-or-update-training-trigger.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | create-or-update-training-trigger', function () {
  let trainingRepository;
  let trainingTriggerRepository;

  beforeEach(function () {
    trainingRepository = {
      get: sinon.stub(),
    };
    trainingTriggerRepository = {
      createOrUpdate: sinon.stub(),
    };
  });

  context('when training does not exist', function () {
    it('should throw an error when training does not exist', async function () {
      // given
      const trainingId = Symbol('trainingId');
      trainingRepository.get.withArgs({ trainingId }).throws(new Error('Not Found'));

      // when
      const error = await catchErr(createOrUpdateTrainingTrigger)({
        trainingId,
        trainingRepository,
      });

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equal('Not Found');
    });
  });

  context('when training exists', function () {
    it('should call create or update trigger repository method', async function () {
      // given
      const trainingId = Symbol('trainingId');
      const tubes = Symbol('tubes');
      const type = Symbol('type');
      const threshold = Symbol('threshold');
      const expectedTrainingTrigger = Symbol('trainingTrigger');
      trainingRepository.get.withArgs({ trainingId }).resolves();
      trainingTriggerRepository.createOrUpdate.resolves(expectedTrainingTrigger);

      // when
      const result = await createOrUpdateTrainingTrigger({
        trainingId,
        tubes,
        type,
        threshold,
        trainingRepository,
        trainingTriggerRepository,
      });

      // then
      expect(trainingTriggerRepository.createOrUpdate).to.have.been.calledWithExactly({
        trainingId,
        triggerTubesForCreation: tubes,
        type,
        threshold,
      });
      expect(result).to.equal(expectedTrainingTrigger);
    });
  });
});
