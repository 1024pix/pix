import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';

describe('Event Choreography | Score Certification', function () {
  it('Should trigger Certification Scoring handler on Assessment Completed event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest(_forTestOnly);
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handleCertificationScoring).to.have.been.calledWithExactly({ domainTransaction, event });
  });
});
