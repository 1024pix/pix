import { AutoJuryDone } from '../../../../lib/domain/events/AutoJuryDone.js';
import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';

describe('Event Choreography | Finalized session', function () {
  it('Should trigger persisting a finalized session on Auto Jury Done event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AutoJuryDone({});

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleSessionFinalized).to.have.been.calledWithExactly({ event, domainTransaction: undefined });
  });
});
