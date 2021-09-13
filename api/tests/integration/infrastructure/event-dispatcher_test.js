const { expect, sinon } = require('../../test-helper');
const EventDispatcher = require('../../../lib/infrastructure/events/EventDispatcher');

function getEventHandlerMock() {
  return sinon.stub();
}

class TestEvent {}

class AnotherTestEvent {}

describe('Integration | Infrastructure | EventHandler', function() {

  it('dispatches event to subscriber', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const event = new TestEvent();
    const domainTransaction = Symbol('domain transaction');
    const eventHandler = getEventHandlerMock();
    eventDispatcher.subscribe(TestEvent, eventHandler);

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(eventHandler).to.have.been.calledWith({ domainTransaction, event });
  });

  it('throws when duplicate subscription', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const eventHandler = getEventHandlerMock();

    // when / then
    expect(() => {
      eventDispatcher.subscribe(TestEvent, eventHandler);
      eventDispatcher.subscribe(AnotherTestEvent, eventHandler);
      eventDispatcher.subscribe(TestEvent, eventHandler);
    }).to.throw();
  });

  it('dispatches event to several eventHandlers', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const event = new TestEvent();
    const domainTransaction = Symbol('domain transaction');
    const eventHandler_1 = getEventHandlerMock();
    const eventHandler_2 = getEventHandlerMock();

    eventDispatcher.subscribe(TestEvent, eventHandler_1);
    eventDispatcher.subscribe(TestEvent, eventHandler_2);

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(eventHandler_1).to.have.been.calledWith({ domainTransaction, event });
    expect(eventHandler_2).to.have.been.calledWith({ domainTransaction, event });
  });

  it('calls handler only for subscribed events', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const event = new TestEvent();
    const domainTransaction = Symbol('domain transaction');
    const eventHandler = getEventHandlerMock();
    const otherEvent = new AnotherTestEvent();

    eventDispatcher.subscribe(TestEvent, eventHandler);

    // when
    await eventDispatcher.dispatch(event, domainTransaction);
    await eventDispatcher.dispatch(otherEvent, domainTransaction);

    // then
    expect(eventHandler).to.have.been.calledWith({ domainTransaction, event });
    expect(eventHandler).not.to.have.been.calledWith({ domainTransaction, otherEvent });
  });

  it('dispatches event returned by eventHandlers', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const event = new TestEvent();
    const domainTransaction = Symbol('domain transaction');
    const returnedEvent = new AnotherTestEvent();
    const originEventEmitter = () => returnedEvent;
    const eventHandler = getEventHandlerMock();
    eventDispatcher.subscribe(TestEvent, originEventEmitter);
    eventDispatcher.subscribe(AnotherTestEvent, eventHandler);

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(eventHandler).to.have.been.calledWith({ domainTransaction, event: returnedEvent });
  });

  it('dispatches events returned by eventHandlers', async function() {
    // given
    const eventDispatcher = new EventDispatcher();
    const event = new TestEvent();
    const domainTransaction = Symbol('domain transaction');
    const returnedEvent1 = new AnotherTestEvent();
    const returnedEvent2 = new AnotherTestEvent();
    const originEventEmitter = () => [returnedEvent1, returnedEvent2];
    const eventHandler = getEventHandlerMock();
    eventDispatcher.subscribe(TestEvent, originEventEmitter);
    eventDispatcher.subscribe(AnotherTestEvent, eventHandler);

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(eventHandler).to.have.been.calledWith({ domainTransaction, event: returnedEvent1 });
    expect(eventHandler).to.have.been.calledWith({ domainTransaction, event: returnedEvent2 });
  });
});
