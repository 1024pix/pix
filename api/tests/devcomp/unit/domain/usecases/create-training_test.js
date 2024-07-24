import { createTraining } from '../../../../../src/devcomp/domain/usecases/create-training.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | create-training', function () {
  it('should call training repository to create the training', async function () {
    // given
    const training = Symbol('training');
    const repositoryResult = Symbol('repository-result');

    const trainingRepositoryStub = {
      create: sinon.stub().resolves(repositoryResult),
    };

    // when
    const result = await createTraining({ training, trainingRepository: trainingRepositoryStub });

    // then
    expect(trainingRepositoryStub.create).to.have.been.calledWithExactly({
      training,
    });
    expect(result).to.equal(repositoryResult);
  });
});
