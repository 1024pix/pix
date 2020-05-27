const { expect, sinon } = require('../../test-helper');
const EventDispatcher = require('../../../lib/infrastructure/events/EventDispatcher');

/*
 * un event, un subscribers, on pop des events, on vérifie que le subscriber a été appelé
 * deux subscribers, on pop des events, on vérifie que les subscribers ont été appelés
 * Notion de domain transaction ???
 * injection
 */

function getSubscriberMock() {
  return {
    handle: sinon.stub()
  };
}

describe('Integration | Infrastructure | EventHandler', () => {
  let eventDispatcher;
  const event = Symbol('an event');

  beforeEach(() => {
    eventDispatcher = new EventDispatcher();
  });

  it('dispatches event to subscriber', () => {
    // given
    const subscriber = getSubscriberMock();
    eventDispatcher.subscribe(event, subscriber);

    // when
    eventDispatcher.dispatch(event);

    // then
    expect(subscriber.handle).to.have.been.calledWith(event);
  });

  it('dispatches event to several subscribers', () => {
    // given
    const subscriber_1 = getSubscriberMock();
    const subscriber_2 = getSubscriberMock();

    eventDispatcher.subscribe(event, subscriber_1);
    eventDispatcher.subscribe(event, subscriber_2);

    // when
    eventDispatcher.dispatch(event);

    // then
    expect(subscriber_1.handle).to.have.been.calledWith(event);
    expect(subscriber_2.handle).to.have.been.calledWith(event);
  });
});
