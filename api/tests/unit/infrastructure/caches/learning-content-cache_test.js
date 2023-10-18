import { expect, sinon } from '../../../test-helper.js';
import { learningContentCache } from '../../../../lib/infrastructure/caches/learning-content-cache.js';

describe('Unit | Infrastructure | Caches | LearningContentCache', function () {
  let originalUnderlyingCache;

  beforeEach(function () {
    originalUnderlyingCache = learningContentCache._underlyingCache;

    learningContentCache._underlyingCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
      quit: sinon.stub(),
    };
  });

  afterEach(function () {
    learningContentCache._underlyingCache = originalUnderlyingCache;
  });

  describe('#get', function () {
    it('should get learning content from underlying cache', async function () {
      // given
      const generator = Symbol('generator');
      const learningContent = Symbol('LearningContent');
      learningContentCache._underlyingCache.get.withArgs('LearningContent', generator).resolves(learningContent);

      // when
      const result = await learningContentCache.get(generator);

      // then
      expect(result).to.equal(learningContent);
    });
  });

  describe('#set', function () {
    it('should set learning content in underlying cache', async function () {
      // given
      const learningContent = Symbol('LearningContent');
      learningContentCache._underlyingCache.set.resolves();

      // when
      await learningContentCache.set(learningContent);

      // then
      expect(learningContentCache._underlyingCache.set).to.have.been.calledWith('LearningContent', learningContent);
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
