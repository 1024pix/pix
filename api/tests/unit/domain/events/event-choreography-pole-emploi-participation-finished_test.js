import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { _forTestOnly } from '../../../../src/prescription/campaign-participation/domain/events/index.js';
import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';

describe('Event Choreography | Pole Emploi Participation Finished', function () {
  it('Should trigger Pole Emploi participation finished handler on AssessmentCompleted event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest(_forTestOnly);
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handlePoleEmploiParticipationFinished).to.have.been.calledWithExactly({
      event,
      domainTransaction,
    });
  });
});
