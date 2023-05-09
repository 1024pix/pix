import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';
import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';

describe('Event Choreography | Pole Emploi Participation Finished', function () {
  it('Should trigger Pole Emploi participation finished handler on AssessmentCompleted event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handlePoleEmploiParticipationFinished).to.have.been.calledWith({ event, domainTransaction });
  });
});
