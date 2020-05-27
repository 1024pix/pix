const { expect, sinon } = require('../../test-helper');
const EventDispatcher = require('../../../lib/infrastructure/events/EventDispatcher');

function getEventHandlerMock() {
  return {
    handle: sinon.stub()
  };
}

describe('Integration | Infrastructure | EventHandler', () => {
  let eventDispatcher;
  const event = Symbol('an event');
  const domainTransaction = Symbol('domain transaction');

  beforeEach(() => {
    eventDispatcher = new EventDispatcher();
  });

  it('dispatches event to subscriber', () => {
    // given
    const eventHandler = getEventHandlerMock();
    eventDispatcher.subscribe(event, eventHandler);

    // when
    eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(eventHandler.handle).to.have.been.calledWith(domainTransaction, event);
  });

  it('dispatches event to several eventHandlers', () => {
    // given
    const eventHandler_1 = getEventHandlerMock();
    const eventHandler_2 = getEventHandlerMock();

    eventDispatcher.subscribe(event, eventHandler_1);
    eventDispatcher.subscribe(event, eventHandler_2);

    // when
    eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(eventHandler_1.handle).to.have.been.calledWith(domainTransaction, event);
    expect(eventHandler_2.handle).to.have.been.calledWith(domainTransaction, event);
  });

  it('calls handler only for subscribed events', () => {
    // given
    const eventHandler = getEventHandlerMock();
    const otherEvent = Symbol('another event');

    eventDispatcher.subscribe(event, eventHandler);

    // when
    eventDispatcher.dispatch(domainTransaction, event);
    eventDispatcher.dispatch(domainTransaction, otherEvent);

    // then
    expect(eventHandler.handle).to.have.been.calledWith(domainTransaction, event);
    expect(eventHandler.handle).not.to.have.been.calledWith(domainTransaction, otherEvent);
  });

  it('dispatches events returned by eventHandlers', () => {
    // given
    const returnedEvent = Symbol('returned event');
    const originEventEmitter = {
      handle() {
        return returnedEvent;
      }
    };
    const eventHandler = getEventHandlerMock();
    eventDispatcher.subscribe(event, originEventEmitter);
    eventDispatcher.subscribe(returnedEvent, eventHandler);

    // when
    eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(eventHandler.handle).to.have.been.calledWith(domainTransaction, returnedEvent);
  });
});
