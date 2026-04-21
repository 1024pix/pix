import sinon from 'sinon';

import { getTopic } from '../../../../src/shared/infrastructure/pubsub.js';

describe('Shared | Unit | Infrastructure | PubSub', function () {
  describe('#getTopic', function () {
    const topicName = Symbol('topicName');

    let pubSub;

    beforeEach(function () {
      pubSub = {
        publish: sinon.stub(),
        subscribe: sinon.stub(),
      };
    });

    it('returns a topic object publishing on given topic name', function () {
      // given
      const message = Symbol('message');

      // when
      getTopic(topicName, pubSub).publish(message);

      // then
      expect(pubSub.publish).to.have.been.calledOnceWithExactly(topicName, message);
    });

    it('returns a topic object subscribing to given topic name', async function () {
      // given
      const message1 = Symbol('message1');
      const message2 = Symbol('message2');

      const { promise: subscriptionEnded, resolve: endSubscription } = Promise.withResolvers();

      pubSub.subscribe.onFirstCall().returns(
        (async function* () {
          yield message1;
          yield message2;
          endSubscription();
        })(),
      );

      const subscribeCallback = sinon.stub();
      subscribeCallback.onFirstCall().throws(new Error());

      // when
      getTopic(topicName, pubSub).subscribe(subscribeCallback);
      await subscriptionEnded;

      // then
      expect(pubSub.subscribe).to.have.been.calledOnceWithExactly(topicName);
      expect(subscribeCallback).to.have.been.calledTwice;
      expect(subscribeCallback.firstCall).to.have.been.calledWithExactly(message1);
      expect(subscribeCallback.secondCall).to.have.been.calledWithExactly(message2);
    });
  });
});
