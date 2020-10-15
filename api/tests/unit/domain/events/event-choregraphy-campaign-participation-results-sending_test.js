const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');

describe('Event Choregraphy | Campaign Participation Results Sending', function() {
  it('Should trigger Campaign Participation Results Sending handler on CampaignParticipationResultsShared event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CampaignParticipationResultsShared();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(handlerStubs.handleCampaignParticipationResultsSending).to.have.been.calledWith({ event, domainTransaction });
  });
});
