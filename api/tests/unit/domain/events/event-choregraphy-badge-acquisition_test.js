const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Event Choregraphy | Badge Acquisition', function() {
  it('Should trigger Badge Acquisition handler on Assessment Completed event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(handlerStubs.handleBadgeAcquisition).to.have.been.calledWith({ domainTransaction, event });
  });
});
