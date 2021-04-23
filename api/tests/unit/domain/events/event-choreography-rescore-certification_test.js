const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const ChallengeDeneutralized = require('../../../../lib/domain/events/ChallengeDeneutralized');

describe('Event Choreography | Rescore Certification', function() {
  it('Should trigger Certification Rescoring handler on ChallengeNeutralized event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ domainTransaction: undefined, event });
  });

  it('Should trigger Certification Rescoring handler on ChallengeDeneutralized event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ domainTransaction: undefined, event });
  });
});
