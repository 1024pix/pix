const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');

describe('Event Choreography | Finalized session', function() {
  it('Should trigger persiting a finalized session on Finalized Session event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new SessionFinalized({});

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleSessionFinalized).to.have.been.calledWith({ event, domainTransaction: undefined });
  });
});
