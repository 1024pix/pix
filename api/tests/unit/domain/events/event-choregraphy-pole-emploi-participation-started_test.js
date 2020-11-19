const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');

describe('Event Choregraphy | Pole Emploi Participation Started', function() {
  it('Should trigger Pole Emploi participation started handler on CampaignParticipationStarted event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CampaignParticipationStarted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.handlePoleEmploiParticipationStarted).to.have.been.calledWith({ event, domainTransaction });
  });
});
