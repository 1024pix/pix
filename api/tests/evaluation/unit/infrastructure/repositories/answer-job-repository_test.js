import { AnswerJobRepository } from '../../../../../src/evaluation/infrastructure/repositories/answer-job-repository.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Infrastructure | Repositories | AnswerJobRepository', function () {
  describe('#performAsync', function () {
    it("should increment user's jobs count in temporary storage", async function () {
      // given
      const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
      const knexStub = { batchInsert: sinon.stub().resolves([]) };
      sinon.stub(DomainTransaction, 'getConnection').returns(knexStub);
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      const userId = Symbol('userId');
      const answerJobRepository = new AnswerJobRepository({
        dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
      });

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      expect(profileRewardTemporaryStorageStub.increment).to.have.been.calledWith(userId);
    });

    describe('should use transaction in all cases', function () {
      it('should use existing transaction', async function () {
        // given
        const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
        const knexStub = { batchInsert: sinon.stub().resolves([]), isTransaction: true };
        sinon.stub(DomainTransaction, 'getConnection').returns(knexStub);
        sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
          return callback();
        });
        const userId = Symbol('userId');
        const answerJobRepository = new AnswerJobRepository({
          dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
        });

        // when
        await answerJobRepository.performAsync({ userId });

        // then
        expect(DomainTransaction.execute).to.have.not.been.called;
      });

      it('should create new transaction', async function () {
        // given
        const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
        const knexStub = { batchInsert: sinon.stub().resolves([]), isTransaction: false };
        sinon.stub(DomainTransaction, 'getConnection').returns(knexStub);
        sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
          return callback();
        });
        const userId = Symbol('userId');
        const answerJobRepository = new AnswerJobRepository({
          dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
        });

        // when
        await answerJobRepository.performAsync({ userId });

        // then
        expect(DomainTransaction.execute).to.have.been.called;
      });
    });
  });
});
