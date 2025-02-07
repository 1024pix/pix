import { AnswerJobRepository } from '../../../../../src/evaluation/infrastructure/repositories/answer-job-repository.js';
import { config } from '../../../../../src/shared/config.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Infrastructure | Repositories | AnswerJobRepository', function () {
  beforeEach(function () {
    sinon.stub(config, 'featureToggles');
    //TODO : comment this stub to quickfix problem (see https://1024pix.atlassian.net/wiki/spaces/DC/pages/4986372097/Erreur+en+RECETTE+Les+certifications+compl+t+es+ne+sont+pas+scor+es+2025-02-07)
    //sinon.stub(pgBoss, 'insert').resolves([]);
    const knexStub = { batchInsert: sinon.stub().resolves([]) };
    sinon.stub(DomainTransaction, 'getConnection').returns(knexStub);
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
    config.featureToggles.isQuestEnabled = true;
    config.featureToggles.isAsyncQuestRewardingCalculationEnabled = true;
  });

  describe('#performAsync', function () {
    it('should do nothing if quests are disabled', async function () {
      // given
      const profileRewardTemporaryStorageStub = { increment: sinon.stub() };
      config.featureToggles.isQuestEnabled = false;
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
      config.featureToggles.isAsyncQuestRewardingCalculationEnabled = false;
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
