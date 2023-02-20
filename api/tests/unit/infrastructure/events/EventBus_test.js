import { expect, sinon } from '../../../test-helper';
import Event from '../../../../lib/domain/events/Event';
import EventBus from '../../../../lib/infrastructure/events/EventBus';

describe('Unit | Infrastructure | Events | EventBus', function () {
  describe('#publish', function () {
    let dependenciesBuilder;

    beforeEach(function () {
      dependenciesBuilder = {
        build: (handler) => handler,
      };
    });

    context('when there is one subscriber', function () {
      it('calls the subscriber', async function () {
        const subscriber = {
          handle: sinon.stub(),
        };
        const event = new Event();
        const eventBus = new EventBus(dependenciesBuilder);

        eventBus.subscribe(Event, subscriber);
        await eventBus.publish(event);

        expect(subscriber.handle).to.have.been.calledWithMatch(event);
      });

      it('does not call the subscriber associated to another Event', async function () {
        const subscriber = { handle: sinon.stub() };
        const eventBus = new EventBus(dependenciesBuilder);
        class EventA {}
        class EventB {}

        eventBus.subscribe(EventA, subscriber);
        await eventBus.publish(new EventB());

        expect(subscriber.handle).not.to.have.been.called;
      });
    });

    context('when there is several subscribers', function () {
      it('calls all subscriber for the given event', async function () {
        const subscriber1 = {
          handle: sinon.stub(),
        };
        const subscriber2 = {
          handle: sinon.stub(),
        };
        const eventBus = new EventBus(dependenciesBuilder);

        eventBus.subscribe(Event, subscriber1);
        eventBus.subscribe(Event, subscriber2);
        await eventBus.publish(new Event());

        expect(subscriber1.handle).to.have.been.called;
        expect(subscriber2.handle).to.have.been.called;
      });
    });

    context('when there is an exception', function () {
      it('does not call the other handlers', async function () {
        const error = new Error();
        const subscriber1 = {
          handle: () => {
            throw error;
          },
        };
        const subscriber2 = {
          handle: sinon.stub(),
        };

        const eventBus = new EventBus(dependenciesBuilder);

        eventBus.subscribe(Event, subscriber1);
        eventBus.subscribe(Event, subscriber2);
        try {
          await eventBus.publish(new Event());
          // eslint-disable-next-line no-empty
        } catch (error) {}

        expect(subscriber2.handle).to.not.have.been.called;
      });
    });
  });
});
