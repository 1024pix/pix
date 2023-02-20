import { expect } from '../../../test-helper';
import buildEventDispatcherAndHandlersForTest from '../../../tooling/events/event-dispatcher-builder';
import CampaignParticipationStarted from '../../../../lib/domain/events/CampaignParticipationStarted';

describe('Event Choreography | Pole Emploi Participation Started', function () {
  it('Should trigger Pole Emploi participation started handler on CampaignParticipationStarted event', async function () {
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
