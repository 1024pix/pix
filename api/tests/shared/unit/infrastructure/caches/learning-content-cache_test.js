import { learningContentCache } from '../../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Caches | LearningContentCache', function () {
  let originalUnderlyingCache;

  beforeEach(function () {
    originalUnderlyingCache = learningContentCache._underlyingCache;

    learningContentCache._underlyingCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      patch: sinon.stub(),
      flushAll: sinon.stub(),
      quit: sinon.stub(),
    };
  });

  afterEach(function () {
    learningContentCache._underlyingCache = originalUnderlyingCache;
  });

  describe('#patch', function () {
    it('should patch the learning content in underlying cache', async function () {
      // given
      learningContentCache._underlyingCache.patch.resolves();
      const patch = { operation: 'assign', path: 'a', value: {} };

      // when
      await learningContentCache.patch(patch);

      // then
      expect(learningContentCache._underlyingCache.patch).to.have.been.calledWith('LearningContent', patch);
    });
  });

  describe('#flushAll', function () {
    it('should flush all the underlying cache', async function () {
      // given
      learningContentCache._underlyingCache.flushAll.resolves();

      // when
      await learningContentCache.flushAll();

      // then
      expect(learningContentCache._underlyingCache.flushAll).to.have.been.calledWith();
    });
  });

  describe('#quit', function () {
    it('should quit the underlying cache', async function () {
      // given
      learningContentCache._underlyingCache.quit.resolves();

      // when
      await learningContentCache.quit();

      // then
      expect(learningContentCache._underlyingCache.quit).to.have.been.calledWith();
    });
  });
});
