const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');
const AutoJuryDone = require('../../../../lib/domain/events/AutoJuryDone');

describe('Event Choreography | Finalized session', function () {
  it('Should trigger the automated jury', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new SessionFinalized({});

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleAutoJury).to.have.been.calledWith({ event, domainTransaction: undefined });
  });

  it('Should trigger persisting a finalized session on Auto Jury Done event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AutoJuryDone({});

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleSessionFinalized).to.have.been.calledWith({ event, domainTransaction: undefined });
  });
});
