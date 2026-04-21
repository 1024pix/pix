import sinon from 'sinon';

import { LearningContentCache } from '../../../../../src/shared/infrastructure/caches/learning-content-cache.js';

describe('Unit | Infrastructure | Caches | LearningContentCache', function () {
  let topic, map, learningContentCache;

  beforeEach(function () {
    topic = {
      subscribe: sinon.stub(),
      publish: sinon.stub(),
    };

    map = {
      get: sinon.stub(),
      set: sinon.stub(),
      delete: sinon.stub(),
      clear: sinon.stub(),
      size: 0,
    };

    learningContentCache = new LearningContentCache({ name: 'test', topic, map });
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
      expect(topic.publish).to.have.been.calledOnceWithExactly({ type: 'delete', key });
    });
  });

  describe('#clear', function () {
    it('should publish clear event on pubSub', async function () {
      // when
      learningContentCache.clear();

      // then
      expect(topic.publish).to.have.been.calledOnceWithExactly({ type: 'clear' });
    });
  });

  describe('subscription callback', function () {
    let callback;

    beforeEach(function () {
      expect(topic.subscribe).to.have.been.calledOnce;
      expect(topic.subscribe.firstCall.args).to.have.lengthOf(1);
      expect(topic.subscribe.firstCall.firstArg).to.be.instanceOf(Function);

      callback = topic.subscribe.firstCall.firstArg;
    });

    describe('when message type is clear', function () {
      it('clears the map', function () {
        // given
        const message = { type: 'clear' };

        // when
        callback(message);

        // then
        expect(map.clear).to.have.been.calledOnceWithExactly();
      });
    });

    describe('when message type is delete', function () {
      it('deletes the key', function () {
        // given
        const message = { type: 'delete', key: 'qwertz' };

        // when
        callback(message);

        // then
        expect(map.delete).to.have.been.calledOnceWithExactly('qwertz');
      });
    });
  });
});
