const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');

describe('Event Choregraphy | Pole Emploi Participation Shared', function() {
  it('Should trigger Pole Emploi participation shared handler on CampaignParticipationResultsShared event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CampaignParticipationResultsShared();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handlePoleEmploiParticipationShared).to.have.been.calledWith({ event, domainTransaction });
  });
});
