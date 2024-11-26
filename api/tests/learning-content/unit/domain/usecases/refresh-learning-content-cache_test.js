import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { refreshLearningContentCache } from '../../../../../src/learning-content/domain/usecases/refresh-learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Usecase | Refresh learning content cache', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  describe('#refreshLearningContentCache', function () {
    it('should trigger a reset of the learning content cache', async function () {
      // given
      const frameworks = Symbol('frameworks');

      const LearningContentCache = {
        instance: {
          reset: sinon.stub().resolves({
            frameworks,
          }),
        },
      };

      const frameworkRepository = {
        save: sinon.stub(),
      };

      // when
      await refreshLearningContentCache({ LearningContentCache, frameworkRepository });

      // then
      expect(LearningContentCache.instance.reset).to.have.been.calledOnce;
      expect(frameworkRepository.save).to.have.been.calledOnceWithExactly(frameworks);
    });
  });
});
