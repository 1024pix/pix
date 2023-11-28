import { expect, sinon } from '../../../../test-helper.js';
import { createTraining } from '../../../../../src/devcomp/domain/usecases/create-training.js';

describe('Unit | Devcomp | Domain | UseCases | create-training', function () {
  it('should call training repository to create the training', async function () {
    // given
    const training = Symbol('training');
    const domainTransaction = Symbol('domain-transaction');
    const repositoryResult = Symbol('repository-result');

    const trainingRepositoryStub = {
      create: sinon.stub().resolves(repositoryResult),
    };

    // when
    const result = await createTraining({ training, domainTransaction, trainingRepository: trainingRepositoryStub });

    // then
    expect(trainingRepositoryStub.create).to.have.been.calledWithExactly({
      training,
      domainTransaction,
    });
    expect(result).to.equal(repositoryResult);
  });
});
