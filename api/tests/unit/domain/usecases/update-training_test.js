const { catchErr, expect, sinon } = require('../../../test-helper');
const updateTraining = require('../../../../lib/domain/usecases/update-training');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-training', function () {
  let trainingRepository;

  beforeEach(function () {
    trainingRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  it('should get a training by its id', async function () {
    const training = { id: 1011 };

    // when
    await updateTraining({
      training,
      trainingRepository,
    });

    // then
    expect(trainingRepository.get).to.have.been.calledWithExactly({ trainingId: training.id });
  });

  it('should throw a NotFoundError when the training does not exist', async function () {
    // given
    const training = { id: 1011 };
    trainingRepository.get.throws(new NotFoundError('Not found training'));

    // when
    const error = await catchErr(updateTraining)({
      training,
      trainingRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('should update training and return it', async function () {
    // given
    const newTrainingAttributes = { id: 1011, title: 'new title' };
    trainingRepository.get.withArgs({ trainingId: newTrainingAttributes.id }).resolves(Symbol('current-training'));
    const expectedUpdatedTraining = Symbol('updated-training');
    trainingRepository.update.resolves(expectedUpdatedTraining);

    // when
    const updatedTraining = await updateTraining({
      training: newTrainingAttributes,
      trainingRepository,
    });

    // then
    expect(trainingRepository.update).to.have.been.calledWithExactly({
      id: newTrainingAttributes.id,
      attributesToUpdate: newTrainingAttributes,
    });
    expect(updatedTraining).to.equal(expectedUpdatedTraining);
  });
});
