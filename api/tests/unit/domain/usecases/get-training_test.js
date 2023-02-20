import { expect, sinon, catchErr } from '../../../test-helper';
import getTraining from '../../../../lib/domain/usecases/get-training';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | get-training', function () {
  let trainingRepository;

  beforeEach(function () {
    trainingRepository = {
      get: sinon.stub(),
    };
  });

  context('when the training exists', function () {
    it('should return an existing training', async function () {
      // given
      const trainingId = 1;
      const trainingToFind = Symbol('existing-training');
      trainingRepository.get.withArgs(trainingId).resolves(trainingToFind);

      // when
      const training = await getTraining({ trainingId, trainingRepository });

      // then
      expect(training).to.equal(trainingToFind);
    });
  });

  context('when the training does not exist', function () {
    it('should throw an error', async function () {
      // given
      const trainingId = 123;
      trainingRepository.get.withArgs(trainingId).rejects(new NotFoundError());

      // when
      const err = await catchErr(getTraining)({ trainingId, trainingRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
