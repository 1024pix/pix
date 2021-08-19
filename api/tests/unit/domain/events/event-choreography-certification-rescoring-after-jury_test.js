const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');

describe('Event Choreography | Certification auto jury', function() {

  it('Should trigger handleAutoJury on SessionFinalized event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new SessionFinalized({
      sessionId: 1,
      finalizedAt: new Date(),
      hasExaminerGlobalComment: false,
      sessionDate: '2020-01-01',
      sessionTime: '10:30:00',
    });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleAutoJury).to.have.been.calledWith({ event, domainTransaction: undefined });
  });
});
