import { expect } from '../../../test-helper';
import buildEventDispatcherAndHandlersForTest from '../../../tooling/events/event-dispatcher-builder';
import ChallengeNeutralized from '../../../../lib/domain/events/ChallengeNeutralized';
import ChallengeDeneutralized from '../../../../lib/domain/events/ChallengeDeneutralized';

describe('Event Choreography | Rescore Certification', function () {
  it('Should trigger Certification Rescoring handler on ChallengeNeutralized event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ domainTransaction: undefined, event });
  });

  it('Should trigger Certification Rescoring handler on ChallengeDeneutralized event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ domainTransaction: undefined, event });
  });
});
