import { LearningContentCache } from '../../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Caches | LearningContentCache', function () {
  let pubSub, map, learningContentCache;

  beforeEach(function () {
    pubSub = {
      subscribe: sinon.stub(),
      publish: sinon.stub(),
    };

    map = {
      get: sinon.stub(),
      set: sinon.stub(),
      delete: sinon.stub(),
      clear: sinon.stub(),
    };

    learningContentCache = new LearningContentCache({ name: 'test', pubSub, map });
  });

  describe('#get', function () {
    it('should call map.get() and return its value', async function () {
      // given
      const key = Symbol('key');
      const value = Symbol('value');
      map.get.withArgs(key).returns(value);

      // when
      const result = learningContentCache.get(key);

      // then
      expect(result).to.equal(value);
      expect(map.get).to.have.been.calledOnceWithExactly(key);
    });
  });

  describe('#set', function () {
    it('should call map.set()', async function () {
      // given
      const key = Symbol('key');
      const value = Symbol('value');

      // when
      learningContentCache.set(key, value);

      // then
      expect(map.set).to.have.been.calledOnceWithExactly(key, value);
    });
  });

  describe('#delete', function () {
    it('should publish delete event on pubSub', async function () {
      // given
      const key = Symbol('key');

      // when
      learningContentCache.delete(key);

      // then
      expect(pubSub.publish).to.have.been.calledOnceWithExactly('test', { type: 'delete', key });
    });
  });

  describe('#clear', function () {
    it('should publish clear event on pubSub', async function () {
      // when
      learningContentCache.clear();

      // then
      expect(pubSub.publish).to.have.been.calledOnceWithExactly('test', { type: 'clear' });
    });
  });
});
