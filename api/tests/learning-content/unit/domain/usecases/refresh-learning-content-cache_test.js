import { refreshLearningContentCache } from '../../../../../src/learning-content/domain/usecases/refresh-learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Usecase | Refresh learning content cache', function () {
  describe('#refreshLearningContentCache', function () {
    it('should trigger a reset of the learning content cache', async function () {
      // given
      const LearningContentCache = {
        instance: {
          reset: sinon.stub(),
        },
      };

      // when
      await refreshLearningContentCache({ LearningContentCache });

      // then
      expect(LearningContentCache.instance.reset).to.have.been.calledOnce;
    });
  });
});
