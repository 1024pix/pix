const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');

describe('Event Choreography | Compute Validated Skills Count', function() {
  it('Should trigger ComputeValidatedSkillsCount on CampaignParticipationResultsShared event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CampaignParticipationResultsShared();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.computeValidatedSkillsCount).to.have.been.calledWith({ event, domainTransaction });
  });
});
