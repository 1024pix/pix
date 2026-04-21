import { setImmediate } from 'node:timers/promises';

import { createPubSub } from '@graphql-yoga/subscription';
import Joi from 'joi';
import sinon from 'sinon';

import {
  FeatureToggleRef,
  FeatureTogglesClient,
} from '../../../../../src/shared/infrastructure/feature-toggles/feature-toggles-client.js';
import { InMemoryKeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/InMemoryKeyValueStorage.js';
import { getTopic } from '../../../../../src/shared/infrastructure/pubsub.js';

describe('Unit | Infrastructure | FeatureToggles | FeatureTogglesClient', function () {
  let config;
  let storage;
  let topic;

  beforeEach(async function () {
    storage = new InMemoryKeyValueStorage();
    config = {
      myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: false, tags: ['tag1', 'tag2'] },
      myToggle2: { description: 'Description 2', type: 'boolean', defaultValue: true },
      myToggle3: { description: 'Description 3', type: 'string', defaultValue: 'foo', tags: ['tag3'] },
    };
    topic = {
      publish: sinon.stub(),
      subscribe: sinon.stub(),
    };
  });

  describe('init', function () {
    it('initialize the storage with config and default values then subscribes to topic', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);

      // when
      await featureToggles.init(config);

      // then
      const savedConfig = await storage.get('_config');
      expect(savedConfig).to.deep.equal(config);

      const all = await featureToggles.all();
      expect(all).to.deep.equal({ myToggle1: false, myToggle2: true, myToggle3: 'foo' });

      expect(topic.subscribe).to.have.been.calledOnce;
      expect(topic.subscribe.firstCall.args).to.have.lengthOf(1);
      expect(topic.subscribe.firstCall.firstArg).to.be.an.instanceOf(Function);
    });

    it('adds and removes in feature toggles storage from a new configuration ', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when
      const newConfig = {
        myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: true },
        myToggle4: { description: 'Description 4', type: 'number', defaultValue: 1 },
      };
      await featureToggles.init(newConfig);

      // then
      const keys = await storage.keys('*');
      expect(keys).to.deep.equal(['myToggle1', 'myToggle4', '_config']);

      const all = await featureToggles.all();
      expect(all).to.deep.equal({ myToggle1: false, myToggle4: 1 });
    });

    it('throws an error when config is invalid', async function () {
      // given
      const invalidConfig = { myToggle1: { defaultValue: false } };
      const featureToggles = new FeatureTogglesClient(storage);

      // when / then
      await expect(featureToggles.init(invalidConfig)).to.rejectedWith(Joi.ValidationError);
    });

    context('when in test environement', function () {
      it('adds feature toggles with provided devDefaultValues.test', async function () {
        // given
        const featureToggles = new FeatureTogglesClient(storage, 'test', topic);

        // when
        await featureToggles.init({
          myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: false },
          myToggle2: {
            description: 'Description 2',
            type: 'boolean',
            defaultValue: false,
            devDefaultValues: { test: true },
          },
        });

        // then
        const all = await featureToggles.all();
        expect(all).to.deep.equal({ myToggle1: false, myToggle2: true });
      });
    });

    context('when in review app environement', function () {
      it('adds feature toggles with provided devDefaultValues.reviewApp', async function () {
        // given
        const featureToggles = new FeatureTogglesClient(storage, 'reviewApp', topic);

        // when
        await featureToggles.init({
          myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: false },
          myToggle2: {
            description: 'Description 2',
            type: 'boolean',
            defaultValue: false,
            devDefaultValues: { reviewApp: true },
          },
        });

        // then
        const all = await featureToggles.all();
        expect(all).to.deep.equal({ myToggle1: false, myToggle2: true });
      });
    });
  });

  describe('get', function () {
    it('returns the value of a feature toggle', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when
      const myToggle1 = await featureToggles.get('myToggle1');
      const myToggle2 = await featureToggles.get('myToggle2');

      // then
      expect(myToggle1).to.equal(false);
      expect(myToggle2).to.equal(true);
    });

    it('throws an error when feature toggle is not found', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when / then
      await expect(featureToggles.get('unknownToggle')).to.rejectedWith(
        'Feature toggle with key "unknownToggle" not found in the configuration',
      );
    });
  });

  describe('set', function () {
    it('sets the value of a feature toggle and publishes a message on topic', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when
      await featureToggles.set('myToggle1', true);
      const myToggle1 = await featureToggles.get('myToggle1');

      // then
      expect(myToggle1).to.equal(true);

      expect(topic.publish).to.have.been.calledOnceWithExactly({
        type: 'set',
        key: 'myToggle1',
      });
    });

    it('throws an error when feature toggle is not found', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when / then
      await expect(featureToggles.set('unknownToggle', true)).to.rejectedWith(
        'Feature toggle with key "unknownToggle" not found in the configuration',
      );
    });
  });

  describe('use', function () {
    ['myToggle1', 'myToggle2', 'myToggle3'].forEach((key) => {
      it(`returns a FeatureToggleRef tracking the value of "${key}"`, async function () {
        // given
        const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
        await featureToggles.init(config);

        // when
        const featureToggleRef = featureToggles.use(key);

        // then
        expect(featureToggleRef).to.be.an.instanceOf(FeatureToggleRef);
        expect(featureToggleRef).to.have.property('value', config[key].defaultValue);
      });
    });

    describe('FeatureToggleRef', function () {
      const key = 'myToggle3';
      let featureToggles, featureToggleRef;

      beforeEach(async function () {
        const pubSub = createPubSub();
        featureToggles = new FeatureTogglesClient(storage, undefined, getTopic('feature-toggles', pubSub));
        await featureToggles.init(config);
        featureToggleRef = featureToggles.use(key);
      });

      describe('value', function () {
        it('returns the up to date value of the feature toggle', async function () {
          // given
          const values = ['fizz', 'buzz', 'fizzbuzz'];

          // when
          const readValues = [];
          for (const value of values) {
            await featureToggles.set(key, value);
            await setImmediate(); // let the event loop run pubsub
            readValues.push(featureToggleRef.value);
          }

          // then
          expect(readValues).to.deep.equal(values);
        });
      });

      describe('watch', function () {
        it('notifies new values of the feature toggle', async function () {
          // given
          const callback = sinon.stub();
          const values = ['fizz', 'buzz', 'fizzbuzz'];

          // when
          const unwatch = featureToggleRef.watch(callback);
          for (const value of values) {
            await featureToggles.set(key, value);
            await setImmediate(); // let the event loop run pubsub
          }
          unwatch();
          await featureToggles.set(key, 'not received');
          await setImmediate(); // let the event loop run pubsub

          // then
          expect(callback).to.have.been.calledThrice;
          expect(callback.firstCall).to.have.been.calledWithExactly(values[0], config[key].defaultValue);
          expect(callback.secondCall).to.have.been.calledWithExactly(values[1], values[0]);
          expect(callback.thirdCall).to.have.been.calledWithExactly(values[2], values[1]);
        });
      });
    });
  });

  describe('all', function () {
    it('returns all feature toggles', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when
      const all = await featureToggles.all();

      // then
      expect(all).to.deep.equal({ myToggle1: false, myToggle2: true, myToggle3: 'foo' });
    });
  });

  describe('withTag', function () {
    it('returns all feature toggles with the specified tag', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);

      // when
      const withTags = await featureToggles.withTag('tag1');

      // then
      expect(withTags).to.deep.equal({ myToggle1: false });
    });
  });

  describe('resetDefaults', function () {
    it('resets all feature toggles to their default values', async function () {
      // given
      const featureToggles = new FeatureTogglesClient(storage, undefined, topic);
      await featureToggles.init(config);
      await featureToggles.set('myToggle1', true);

      // when
      await featureToggles.resetDefaults();
      const all = await featureToggles.all();

      // then
      expect(all).to.deep.equal({ myToggle1: false, myToggle2: true, myToggle3: 'foo' });
    });

    context('when in test environement', function () {
      it('resets feature toggles with provided devDefaultValues.test', async function () {
        // given
        const featureToggles = new FeatureTogglesClient(storage, 'test', topic);
        await featureToggles.init({
          myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: false },
          myToggle2: {
            description: 'Description 2',
            type: 'boolean',
            defaultValue: false,
            devDefaultValues: { test: true },
          },
        });
        await featureToggles.set('myToggle1', true);
        await featureToggles.set('myToggle2', false);

        // when
        await featureToggles.resetDefaults();

        // then
        const all = await featureToggles.all();
        expect(all).to.deep.equal({ myToggle1: false, myToggle2: true });
      });
    });

    context('when in review app environement', function () {
      it('resets feature toggles with provided devDefaultValues.reviewApp', async function () {
        // given
        const featureToggles = new FeatureTogglesClient(storage, 'reviewApp', topic);
        await featureToggles.init({
          myToggle1: { description: 'Description 1', type: 'boolean', defaultValue: false },
          myToggle2: {
            description: 'Description 2',
            type: 'boolean',
            defaultValue: false,
            devDefaultValues: { reviewApp: true },
          },
        });
        await featureToggles.set('myToggle1', true);
        await featureToggles.set('myToggle2', false);

        // when
        await featureToggles.resetDefaults();

        // then
        const all = await featureToggles.all();
        expect(all).to.deep.equal({ myToggle1: false, myToggle2: true });
      });
    });
  });
});
