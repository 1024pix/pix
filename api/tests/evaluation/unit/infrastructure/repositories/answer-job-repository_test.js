import { AnswerJobRepository } from '../../../../../src/evaluation/infrastructure/repositories/answer-job-repository.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { pgBoss } from '../../../../../src/shared/infrastructure/repositories/jobs/pg-boss.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Infrastructure | Repositories | AnswerJobRepository', function () {
  beforeEach(async function () {
    await featureToggles.set('isQuestEnabled', true);
    await featureToggles.set('isAsyncQuestRewardingCalculationEnabled', true);
    sinon.stub(pgBoss, 'send').resolves([]);
    sinon.stub(DomainTransaction, 'getConnection').returns({
      client: { acquireConnection: sinon.stub().resolves({ query: sinon.stub() }), releaseConnection: sinon.stub() },
    });
  });

  describe('#performAsync', function () {
    it('should do nothing if quests are disabled', async function () {
      // given
      const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
      await featureToggles.set('isQuestEnabled', false);
      const userId = Symbol('userId');
      const answerJobRepository = new AnswerJobRepository({
        dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
      });

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      expect(profileRewardTemporaryStorageStub.increment).not.to.have.been.called;
    });

    it('should do nothing if quests are in sync mode', async function () {
      // given
      const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
      await featureToggles.set('isAsyncQuestRewardingCalculationEnabled', false);
      const userId = Symbol('userId');
      const answerJobRepository = new AnswerJobRepository({
        dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
      });

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      expect(profileRewardTemporaryStorageStub.increment).not.to.have.been.called;
    });

    it("should increment user's jobs count in temporary storage", async function () {
      // given
      const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
      const userId = Symbol('userId');
      const answerJobRepository = new AnswerJobRepository({
        dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
      });

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      expect(profileRewardTemporaryStorageStub.increment).to.have.been.calledWith(userId);
    });
  });
});
