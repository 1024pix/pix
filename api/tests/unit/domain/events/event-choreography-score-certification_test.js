import { expect } from '../../../test-helper';
import buildEventDispatcherAndHandlersForTest from '../../../tooling/events/event-dispatcher-builder';
import AssessmentCompleted from '../../../../lib/domain/events/AssessmentCompleted';

describe('Event Choreography | Score Certification', function () {
  it('Should trigger Certification Scoring handler on Assessment Completed event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handleCertificationScoring).to.have.been.calledWith({ domainTransaction, event });
  });
});
